import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';

export interface LoginResult {
    success: boolean;
    message?: string;
}

interface AuthState {
    isLoggedIn: boolean;
    username: string | null;
    token: string | null;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly STORAGE_KEY = 'buchspa_auth';
    private readonly TOKEN_KEY = 'buchspa_token';
    private readonly SESSION_KEY = 'buchspa_session';

    private readonly authState$ = new BehaviorSubject<AuthState>(
        this.loadAuthState(),
    );

    readonly isLoggedIn$: Observable<boolean> = new BehaviorSubject<boolean>(
        this.loadAuthState().isLoggedIn,
    );

    constructor() {
        // Server-Session-Check: Logout bei Server-Neustart
        this.checkServerSession();

        // Synchronisiere isLoggedIn$ mit authState$
        this.authState$.subscribe((state) => {
            (this.isLoggedIn$ as BehaviorSubject<boolean>).next(
                state.isLoggedIn,
            );
        });
    }

    login(username: string, password: string): Observable<LoginResult> {
        // Relative URL - wird vom Proxy an das HTTPS-Backend weitergeleitet
        const url = '/auth/token';
        const body = { username, password };

        return this.http.post<TokenResponse>(url, body).pipe(
            map((response) => {
                // Token speichern
                localStorage.setItem(this.TOKEN_KEY, response.access_token);

                // Server-Session-ID speichern (für Neustart-Erkennung)
                this.updateServerSession();

                // Auth-State aktualisieren
                const newState: AuthState = {
                    isLoggedIn: true,
                    username,
                    token: response.access_token,
                };
                this.saveAuthState(newState);
                this.authState$.next(newState);

                return { success: true };
            }),
            catchError((error) => {
                console.error('Login-Fehler:', error);
                return of({
                    success: false,
                    message: 'Benutzername oder Passwort ist falsch.',
                });
            }),
        );
    }

    logout(): void {
        // Token entfernen
        localStorage.removeItem(this.TOKEN_KEY);

        const newState: AuthState = {
            isLoggedIn: false,
            username: null,
            token: null,
        };
        this.saveAuthState(newState);
        this.authState$.next(newState);
    }

    isLoggedIn(): boolean {
        return this.authState$.value.isLoggedIn;
    }

    getCurrentUser(): string | null {
        return this.authState$.value.username;
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private loadAuthState(): AuthState {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const state = JSON.parse(stored);
                // Token aus separatem Storage holen
                const token = localStorage.getItem(this.TOKEN_KEY);
                return { ...state, token };
            }
        } catch (error) {
            console.error('Fehler beim Laden des Auth-Status:', error);
        }
        return { isLoggedIn: false, username: null, token: null };
    }

    private saveAuthState(state: AuthState): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Fehler beim Speichern des Auth-Status:', error);
        }
    }

    /**
     * Prüft Server-Session und loggt bei Neustart automatisch aus
     */
    private checkServerSession(): void {
        if (!this.authState$.value.isLoggedIn) {
            return;
        }

        const loginTimestamp = localStorage.getItem(this.SESSION_KEY);
        if (!loginTimestamp) {
            // Kein Login-Timestamp vorhanden, Logout zur Sicherheit
            this.logout();
            return;
        }

        // Prüfe, ob das Token noch gültig ist
        // Wenn Server neu gestartet wurde, wird eine Anfrage mit dem alten Token fehlschlagen
        this.http
            .get<any>('/health/liveness', {
                observe: 'response',
            })
            .pipe(
                catchError((error) => {
                    // Bei Auth-Fehler (401/403) → Server wurde neu gestartet
                    if (error.status === 401 || error.status === 403) {
                        console.log(
                            'Server wurde neu gestartet - automatischer Logout',
                        );
                        this.logout();
                    }
                    return of(null);
                }),
            )
            .subscribe();
    }

    /**
     * Speichert Login-Timestamp als Session-Marker
     */
    private updateServerSession(): void {
        const now = Date.now().toString();
        localStorage.setItem(this.SESSION_KEY, now);
    }
}
