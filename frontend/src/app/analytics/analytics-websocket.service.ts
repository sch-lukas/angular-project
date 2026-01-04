/**
 * Analytics WebSocket Service - Verbindung zum Backend für Live-Tracking
 */
import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface CartItem {
    id: number;
    titel: string;
    preis: number;
    quantity: number;
}

export interface WishlistItem {
    id: number;
    titel: string;
}

export interface ViewedBook {
    id: number;
    title: string;
    viewedAt: Date;
}

export interface SessionInfo {
    sessionId: string;
    userAgent: string;
    connectedAt: Date;
    currentPage?: string;
    cart: CartItem[];
    wishlist: WishlistItem[];
    viewedBooks: ViewedBook[];
    cartValue: number;
}

export interface AnalyticsData {
    activeVisitors: number;
    sessions: SessionInfo[];
    totalCartValue: number;
    totalCartItems: number;
    totalWishlistItems: number;
    totalBooksViewed: number;
}

export interface ServerInfo {
    serverStartTime: number;
}

@Injectable({
    providedIn: 'root',
})
export class AnalyticsWebSocketService implements OnDestroy {
    private readonly ngZone = inject(NgZone);
    private socket: Socket | null = null;
    private readonly sessionId: string;

    private readonly analyticsDataSubject =
        new BehaviorSubject<AnalyticsData | null>(null);
    readonly analyticsData$: Observable<AnalyticsData | null> =
        this.analyticsDataSubject.asObservable();

    private readonly connectedSubject = new BehaviorSubject<boolean>(false);
    readonly connected$: Observable<boolean> =
        this.connectedSubject.asObservable();

    // Subject für Server-Restart-Erkennung
    private readonly serverRestartSubject = new BehaviorSubject<boolean>(false);
    readonly serverRestart$: Observable<boolean> =
        this.serverRestartSubject.asObservable();

    private readonly SERVER_START_KEY = 'buchshop-server-start-time';

    constructor() {
        // Generiere oder lade eine persistente Session-ID
        this.sessionId = this.getOrCreateSessionId();
    }

    private getOrCreateSessionId(): string {
        const storageKey = 'analytics_session_id';
        let sessionId = sessionStorage.getItem(storageKey);
        if (!sessionId) {
            sessionId =
                'sess_' +
                Math.random().toString(36).substring(2, 15) +
                Date.now().toString(36);
            sessionStorage.setItem(storageKey, sessionId);
        }
        return sessionId;
    }

    connect(isAdmin: boolean = false): void {
        if (this.socket?.connected) {
            return;
        }

        // WebSocket zum Backend - über gleichen Host wie Frontend (Proxy leitet weiter)
        // Bei localhost:4200 geht es über Proxy zu localhost:3000
        // Bei Tunnel geht es direkt zu localhost:3000 (Backend muss erreichbar sein)
        const protocol =
            globalThis.location.protocol === 'https:' ? 'https:' : 'http:';
        const host = globalThis.location.hostname;
        const port = globalThis.location.port;

        // Wenn wir auf localhost:4200 sind, nutze den Proxy
        // Ansonsten (Tunnel) verbinde direkt zum Backend
        let wsUrl: string;
        if (host === 'localhost' && port === '4200') {
            // Lokale Entwicklung - nutze Proxy (kein Namespace, nur Basis-URL)
            wsUrl = `${protocol}//${host}:${port}`;
        } else {
            // Tunnel oder Produktion - verbinde direkt zum Backend
            wsUrl = `https://localhost:3000`;
        }

        console.log('Analytics: Connecting to', wsUrl, 'isAdmin:', isAdmin);

        this.socket = io(wsUrl, {
            path: '/socket.io',
            // Polling zuerst für bessere Kompatibilität mit selbstsignierten Zertifikaten
            transports: ['polling', 'websocket'],
            secure: protocol === 'https:',
            rejectUnauthorized: false, // Für selbstsignierte Zertifikate
            query: {
                sessionId: this.sessionId,
                isAdmin: isAdmin ? 'true' : 'false',
            },
        });

        this.socket.on('connect', () => {
            this.ngZone.run(() => {
                console.log(
                    'Analytics WebSocket connected, sessionId:',
                    this.sessionId,
                );
                this.connectedSubject.next(true);
            });
        });

        // Server-Info empfangen (für Server-Restart-Erkennung)
        this.socket.on('server-info', (data: ServerInfo) => {
            this.ngZone.run(() => {
                console.log('Server info received:', data);
                this.checkServerRestart(data.serverStartTime);
            });
        });

        // Admin-Dashboard Updates empfangen
        this.socket.on('analytics-update', (data: AnalyticsData) => {
            this.ngZone.run(() => {
                console.log('Analytics data received:', data);
                this.analyticsDataSubject.next(data);
            });
        });

        this.socket.on('disconnect', () => {
            this.ngZone.run(() => {
                console.log('Analytics WebSocket disconnected');
                this.connectedSubject.next(false);
            });
        });

        this.socket.on('connect_error', (error: Error) => {
            this.ngZone.run(() => {
                console.error('Analytics WebSocket connection error:', error);
                this.connectedSubject.next(false);
            });
        });
    }

    /**
     * Prüft ob der Socket verbunden ist
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectedSubject.next(false);
    }

    // Admin tritt dem Admin-Room bei um Updates zu erhalten
    joinAdminRoom(): void {
        if (this.socket?.connected) {
            console.log('Joining admin room...');
            this.socket.emit('join-admin');
            // Nach dem Beitreten Daten anfordern
            this.requestAnalyticsData();
        } else {
            console.warn('Cannot join admin room - not connected');
        }
    }

    // Analytics-Daten vom Server anfordern
    requestAnalyticsData(): void {
        if (this.socket?.connected) {
            console.log('Requesting analytics data...');
            this.socket.emit('request-analytics');
        }
    }

    // Admin verlässt den Admin-Room
    leaveAdminRoom(): void {
        if (this.socket?.connected) {
            this.socket.emit('leave-admin');
        }
    }

    // Warenkorb-Update senden
    sendCartUpdate(items: CartItem[]): void {
        if (this.socket?.connected) {
            this.socket.emit('cart-update', {
                sessionId: this.sessionId,
                items,
            });
        }
    }

    // Merklisten-Update senden
    sendWishlistUpdate(items: WishlistItem[]): void {
        if (this.socket?.connected) {
            this.socket.emit('wishlist-update', {
                sessionId: this.sessionId,
                items,
            });
        }
    }

    // Buch-Ansicht senden
    sendBookViewed(bookId: number, title: string): void {
        if (this.socket?.connected) {
            this.socket.emit('book-viewed', {
                sessionId: this.sessionId,
                bookId,
                title,
            });
        }
    }

    // Seitennavigation senden
    sendPageView(page: string): void {
        if (this.socket?.connected) {
            this.socket.emit('page-view', { sessionId: this.sessionId, page });
        }
    }

    /**
     * Prüft ob der Server neu gestartet wurde und signalisiert ggf. einen Reset
     */
    private checkServerRestart(serverStartTime: number): void {
        const storedStartTime = localStorage.getItem(this.SERVER_START_KEY);
        const storedStartTimeNum = storedStartTime
            ? Number.parseInt(storedStartTime, 10)
            : null;

        console.log(
            'Server start time check:',
            'stored=',
            storedStartTimeNum,
            'received=',
            serverStartTime,
        );

        if (
            storedStartTimeNum !== null &&
            storedStartTimeNum !== serverStartTime
        ) {
            // Server wurde neu gestartet!
            console.log(
                'Server restart detected! Old:',
                storedStartTimeNum,
                'New:',
                serverStartTime,
            );
            this.serverRestartSubject.next(true);
            // Reset das Flag nach kurzer Zeit
            setTimeout(() => this.serverRestartSubject.next(false), 100);
        }

        // Speichere die neue Server-Start-Zeit
        localStorage.setItem(this.SERVER_START_KEY, serverStartTime.toString());
    }

    /**
     * Gibt an, ob der Server gerade als neu gestartet erkannt wurde
     */
    wasServerRestarted(): boolean {
        return this.serverRestartSubject.value;
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
