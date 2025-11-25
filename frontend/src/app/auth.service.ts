import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoginResult {
    success: boolean;
    message?: string;
}

interface AuthState {
    isLoggedIn: boolean;
    username: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly STORAGE_KEY = 'buchspa_auth';
    private readonly VALID_USERNAME = 'admin';
    private readonly VALID_PASSWORD = 'p';

    private readonly authState$ = new BehaviorSubject<AuthState>(
        this.loadAuthState(),
    );

    readonly isLoggedIn$: Observable<boolean> = new BehaviorSubject<boolean>(
        this.loadAuthState().isLoggedIn,
    );

    constructor() {
        // Synchronisiere isLoggedIn$ mit authState$
        this.authState$.subscribe((state) => {
            (this.isLoggedIn$ as BehaviorSubject<boolean>).next(
                state.isLoggedIn,
            );
        });
    }

    login(username: string, password: string): LoginResult {
        if (
            username === this.VALID_USERNAME &&
            password === this.VALID_PASSWORD
        ) {
            const newState: AuthState = {
                isLoggedIn: true,
                username,
            };
            this.saveAuthState(newState);
            this.authState$.next(newState);
            return { success: true };
        }

        return {
            success: false,
            message: 'Benutzername oder Passwort ist falsch.',
        };
    }

    logout(): void {
        const newState: AuthState = {
            isLoggedIn: false,
            username: null,
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

    private loadAuthState(): AuthState {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Fehler beim Laden des Auth-Status:', error);
        }
        return { isLoggedIn: false, username: null };
    }

    private saveAuthState(state: AuthState): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Fehler beim Speichern des Auth-Status:', error);
        }
    }
}
