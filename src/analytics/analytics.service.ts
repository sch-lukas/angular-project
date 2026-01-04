/**
 * Analytics Service - In-Memory Speicherung von Session-Daten
 */
import { Injectable } from '@nestjs/common';
import { getLogger } from '../logger/logger.js';

const logger = getLogger(import.meta.url);

export interface SessionData {
    socketId: string;
    userAgent: string;
    connectedAt: Date;
    currentPage?: string | undefined;
    cart: CartItem[];
    wishlist: WishlistItem[];
    viewedBooks: ViewedBook[];
}

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

export interface AnalyticsData {
    activeVisitors: number;
    sessions: SessionInfo[];
    totalCartValue: number;
    totalCartItems: number;
    totalWishlistItems: number;
    totalBooksViewed: number;
}

export interface SessionInfo {
    sessionId: string;
    userAgent: string;
    connectedAt: Date;
    currentPage?: string | undefined;
    cart: CartItem[];
    wishlist: WishlistItem[];
    viewedBooks: ViewedBook[];
    cartValue: number;
}

@Injectable()
export class AnalyticsService {
    private readonly sessions = new Map<string, SessionData>();
    private readonly pendingDisconnects = new Map<string, NodeJS.Timeout>();

    // Server-Start-Zeitstempel für Client-Synchronisation
    readonly serverStartTime: number = Date.now();

    // Verzögerung vor dem Löschen einer Session (30 Sekunden für Page-Refresh)
    private readonly DISCONNECT_DELAY_MS = 30000;

    addSession(sessionId: string, data: Partial<SessionData>) {
        // Falls ein Pending-Disconnect existiert, abbrechen
        const pendingTimeout = this.pendingDisconnects.get(sessionId);
        if (pendingTimeout) {
            clearTimeout(pendingTimeout);
            this.pendingDisconnects.delete(sessionId);
            logger.info(
                `Session ${sessionId} reconnected, cancelled pending removal`,
            );
        }

        const existing = this.sessions.get(sessionId);
        this.sessions.set(sessionId, {
            socketId: data.socketId ?? '',
            userAgent: data.userAgent ?? 'Unknown',
            connectedAt:
                existing?.connectedAt ?? data.connectedAt ?? new Date(),
            currentPage: existing?.currentPage,
            cart: existing?.cart ?? [],
            wishlist: existing?.wishlist ?? [],
            viewedBooks: existing?.viewedBooks ?? [],
        });
        logger.info(
            `Session added/updated: ${sessionId}, Total sessions: ${this.sessions.size}`,
        );
    }

    removeSession(sessionId: string) {
        // Nicht sofort löschen, sondern mit Verzögerung (für Page-Refresh)
        const existingTimeout = this.pendingDisconnects.get(sessionId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
            this.sessions.delete(sessionId);
            this.pendingDisconnects.delete(sessionId);
            logger.info(
                `Session removed after delay: ${sessionId}, Total sessions: ${this.sessions.size}`,
            );
        }, this.DISCONNECT_DELAY_MS);

        this.pendingDisconnects.set(sessionId, timeout);
        logger.info(
            `Session disconnect scheduled: ${sessionId} (will be removed in ${this.DISCONNECT_DELAY_MS}ms if no reconnect)`,
        );
    }

    /**
     * Sofortige Session-Entfernung (z.B. bei explizitem Logout)
     */
    removeSessionImmediately(sessionId: string) {
        const pendingTimeout = this.pendingDisconnects.get(sessionId);
        if (pendingTimeout) {
            clearTimeout(pendingTimeout);
            this.pendingDisconnects.delete(sessionId);
        }
        this.sessions.delete(sessionId);
        logger.info(
            `Session removed immediately: ${sessionId}, Total sessions: ${this.sessions.size}`,
        );
    }

    updateCart(sessionId: string, items: CartItem[]) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.cart = items;
        }
    }

    updateWishlist(sessionId: string, items: WishlistItem[]) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.wishlist = items;
        }
    }

    addViewedBook(sessionId: string, bookId: number, title: string) {
        const session = this.sessions.get(sessionId);
        if (session) {
            // Duplikate vermeiden, aber neuen Zeitstempel setzen
            const existingIndex = session.viewedBooks.findIndex(
                (b) => b.id === bookId,
            );
            if (existingIndex >= 0) {
                session.viewedBooks[existingIndex]!.viewedAt = new Date();
            } else {
                session.viewedBooks.push({
                    id: bookId,
                    title,
                    viewedAt: new Date(),
                });
            }
            // Maximal 20 letzte Bücher behalten
            if (session.viewedBooks.length > 20) {
                session.viewedBooks = session.viewedBooks.slice(-20);
            }
        }
    }

    updateCurrentPage(sessionId: string, page: string) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.currentPage = page;
        }
    }

    getAnalyticsData(): AnalyticsData {
        const sessions: SessionInfo[] = [];
        let totalCartValue = 0;
        let totalCartItems = 0;
        let totalWishlistItems = 0;
        let totalBooksViewed = 0;

        for (const [sessionId, data] of this.sessions) {
            const cartValue = data.cart.reduce(
                (sum, item) => sum + item.preis * item.quantity,
                0,
            );
            totalCartValue += cartValue;
            totalCartItems += data.cart.reduce(
                (sum, item) => sum + item.quantity,
                0,
            );
            totalWishlistItems += data.wishlist.length;
            totalBooksViewed += data.viewedBooks.length;

            sessions.push({
                sessionId: sessionId.substring(0, 8) + '...', // Gekürzt für Datenschutz
                userAgent: this.parseUserAgent(data.userAgent),
                connectedAt: data.connectedAt,
                currentPage: data.currentPage,
                cart: data.cart,
                wishlist: data.wishlist,
                viewedBooks: data.viewedBooks,
                cartValue,
            });
        }

        return {
            activeVisitors: this.sessions.size,
            sessions,
            totalCartValue,
            totalCartItems,
            totalWishlistItems,
            totalBooksViewed,
        };
    }

    private parseUserAgent(ua: string): string {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    /**
     * Gibt die Analytics-Daten als formatierte Tabelle in der Konsole aus
     */
    printToConsole(): void {
        const data = this.getAnalyticsData();
        const now = new Date().toLocaleTimeString('de-DE');

        // Clear screen und Cursor nach oben (ANSI)
        process.stdout.write('\x1B[2J\x1B[0f');

        // Header
        console.log(
            '\x1b[36m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m',
        );
        console.log(
            '\x1b[36m║\x1b[0m  \x1b[1m\x1b[33m📊 LIVE ANALYTICS DASHBOARD\x1b[0m                                    \x1b[90m' +
                now +
                '\x1b[0m  \x1b[36m║\x1b[0m',
        );
        console.log(
            '\x1b[36m╠══════════════════════════════════════════════════════════════════════════════╣\x1b[0m',
        );

        // Statistik-Übersicht
        console.log(
            '\x1b[36m║\x1b[0m                                                                              \x1b[36m║\x1b[0m',
        );
        console.log(
            '\x1b[36m║\x1b[0m  \x1b[1m👥 Aktive Besucher:\x1b[0m \x1b[32m' +
                this.pad(String(data.activeVisitors), 5) +
                '\x1b[0m    \x1b[1m🛒 Warenkorb-Artikel:\x1b[0m \x1b[32m' +
                this.pad(String(data.totalCartItems), 5) +
                '\x1b[0m          \x1b[36m║\x1b[0m',
        );
        console.log(
            '\x1b[36m║\x1b[0m  \x1b[1m💰 Potentieller Umsatz:\x1b[0m \x1b[33m' +
                this.pad(data.totalCartValue.toFixed(2) + '€', 10) +
                '\x1b[0m  \x1b[1m💜 Merkliste:\x1b[0m \x1b[35m' +
                this.pad(String(data.totalWishlistItems), 5) +
                '\x1b[0m              \x1b[36m║\x1b[0m',
        );
        console.log(
            '\x1b[36m║\x1b[0m  \x1b[1m👁️  Angesehene Bücher:\x1b[0m \x1b[34m' +
                this.pad(String(data.totalBooksViewed), 5) +
                '\x1b[0m                                          \x1b[36m║\x1b[0m',
        );
        console.log(
            '\x1b[36m║\x1b[0m                                                                              \x1b[36m║\x1b[0m',
        );

        if (data.sessions.length === 0) {
            console.log(
                '\x1b[36m╠══════════════════════════════════════════════════════════════════════════════╣\x1b[0m',
            );
            console.log(
                '\x1b[36m║\x1b[0m  \x1b[90mKeine aktiven Besucher momentan...\x1b[0m                                        \x1b[36m║\x1b[0m',
            );
        } else {
            // Sessions-Tabelle
            console.log(
                '\x1b[36m╠══════════════════════════════════════════════════════════════════════════════╣\x1b[0m',
            );
            console.log(
                '\x1b[36m║\x1b[0m  \x1b[1m\x1b[4mSession\x1b[0m     \x1b[1m\x1b[4mBrowser\x1b[0m   \x1b[1m\x1b[4mSeite\x1b[0m              \x1b[1m\x1b[4m🛒\x1b[0m    \x1b[1m\x1b[4m💜\x1b[0m    \x1b[1m\x1b[4m👁️\x1b[0m     \x1b[1m\x1b[4mWert\x1b[0m      \x1b[36m║\x1b[0m',
            );
            console.log(
                '\x1b[36m╟──────────────────────────────────────────────────────────────────────────────╢\x1b[0m',
            );

            for (const session of data.sessions) {
                const page = this.truncate(session.currentPage ?? '-', 16);
                const cartCount = session.cart.reduce(
                    (s, i) => s + i.quantity,
                    0,
                );
                const wishCount = session.wishlist.length;
                const viewCount = session.viewedBooks.length;
                const value = session.cartValue.toFixed(2) + '€';

                console.log(
                    '\x1b[36m║\x1b[0m  ' +
                        '\x1b[90m' +
                        this.pad(session.sessionId, 10) +
                        '\x1b[0m  ' +
                        this.pad(session.userAgent, 9) +
                        '  ' +
                        '\x1b[94m' +
                        this.pad(page, 16) +
                        '\x1b[0m  ' +
                        '\x1b[32m' +
                        this.pad(String(cartCount), 4) +
                        '\x1b[0m  ' +
                        '\x1b[35m' +
                        this.pad(String(wishCount), 4) +
                        '\x1b[0m  ' +
                        '\x1b[34m' +
                        this.pad(String(viewCount), 4) +
                        '\x1b[0m  ' +
                        '\x1b[33m' +
                        this.pad(value, 9) +
                        '\x1b[0m ' +
                        '\x1b[36m║\x1b[0m',
                );

                // Zeige Warenkorb-Details wenn vorhanden
                if (session.cart.length > 0) {
                    for (const item of session.cart.slice(0, 3)) {
                        const title = this.truncate(item.titel, 30);
                        console.log(
                            '\x1b[36m║\x1b[0m      \x1b[90m└─ 🛒 ' +
                                title +
                                ' (' +
                                item.quantity +
                                'x ' +
                                item.preis.toFixed(2) +
                                '€)\x1b[0m' +
                                ' '.repeat(Math.max(0, 35 - title.length)) +
                                '\x1b[36m║\x1b[0m',
                        );
                    }
                    if (session.cart.length > 3) {
                        console.log(
                            '\x1b[36m║\x1b[0m      \x1b[90m   ... und ' +
                                (session.cart.length - 3) +
                                ' weitere\x1b[0m                                        \x1b[36m║\x1b[0m',
                        );
                    }
                }
            }
        }

        console.log(
            '\x1b[36m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m',
        );
        console.log('\x1b[90mDrücke Strg+C zum Beenden\x1b[0m\n');
    }

    private pad(str: string, len: number): string {
        return str.length >= len
            ? str.substring(0, len)
            : str + ' '.repeat(len - str.length);
    }

    private truncate(str: string, len: number): string {
        return str.length > len ? str.substring(0, len - 2) + '..' : str;
    }
}
