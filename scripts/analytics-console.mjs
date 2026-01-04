/**
 * Analytics Console - Live-Anzeige der Besucher-Statistiken im Terminal
 *
 * Startet einen WebSocket-Client der sich mit dem Backend verbindet
 * und die Analytics-Daten als formatierte Tabelle ausgibt.
 *
 * Usage: node scripts/analytics-console.mjs
 */
import process from 'node:process';
import { io } from '../frontend/node_modules/socket.io-client/build/esm/index.js';

// Selbstsignierte Zertifikate akzeptieren
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const WS_URL = 'https://localhost:3000';

console.clear();
console.log('\x1b[33m🔌 Verbinde mit Analytics-Server...\x1b[0m\n');

const socket = io(WS_URL, {
    path: '/socket.io',
    // Polling zuerst, dann WebSocket - besser für selbstsignierte Zertifikate
    transports: ['polling', 'websocket'],
    secure: true,
    rejectUnauthorized: false,
    query: {
        isAdmin: 'true',
    },
});

socket.on('connect', () => {
    console.log('\x1b[32m✅ Verbunden mit Analytics-Server\x1b[0m\n');
});

socket.on('disconnect', () => {
    console.clear();
    console.log('\x1b[31m❌ Verbindung zum Server verloren\x1b[0m');
    console.log('\x1b[90mVersuche erneut zu verbinden...\x1b[0m\n');
});

socket.on('connect_error', (error) => {
    console.log('\x1b[31m❌ Verbindungsfehler:\x1b[0m', error.message);
    console.log(
        '\x1b[90mIst der Backend-Server gestartet? (pnpm dev)\x1b[0m\n',
    );
});

socket.on('analytics-update', (data) => {
    printDashboard(data);
});

function printDashboard(data) {
    const now = new Date().toLocaleTimeString('de-DE');

    // Clear screen
    console.clear();

    // Header
    console.log(
        '\x1b[36m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m',
    );
    console.log(
        '\x1b[36m║\x1b[0m  \x1b[1m\x1b[33m📊 LIVE ANALYTICS CONSOLE\x1b[0m                                      \x1b[90m' +
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
            pad(String(data.activeVisitors), 5) +
            '\x1b[0m    \x1b[1m🛒 Warenkorb-Artikel:\x1b[0m \x1b[32m' +
            pad(String(data.totalCartItems), 5) +
            '\x1b[0m          \x1b[36m║\x1b[0m',
    );
    console.log(
        '\x1b[36m║\x1b[0m  \x1b[1m💰 Potentieller Umsatz:\x1b[0m \x1b[33m' +
            pad(data.totalCartValue.toFixed(2) + '€', 10) +
            '\x1b[0m  \x1b[1m💜 Merkliste:\x1b[0m \x1b[35m' +
            pad(String(data.totalWishlistItems), 5) +
            '\x1b[0m              \x1b[36m║\x1b[0m',
    );
    console.log(
        '\x1b[36m║\x1b[0m  \x1b[1m👁️  Angesehene Bücher:\x1b[0m \x1b[34m' +
            pad(String(data.totalBooksViewed), 5) +
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
        console.log(
            '\x1b[36m║\x1b[0m  \x1b[90mWarte auf Verbindungen...\x1b[0m                                                 \x1b[36m║\x1b[0m',
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
            const page = truncate(session.currentPage ?? '-', 16);
            const cartCount = session.cart.reduce((s, i) => s + i.quantity, 0);
            const wishCount = session.wishlist.length;
            const viewCount = session.viewedBooks.length;
            const value = session.cartValue.toFixed(2) + '€';

            console.log(
                '\x1b[36m║\x1b[0m  ' +
                    '\x1b[90m' +
                    pad(session.sessionId, 10) +
                    '\x1b[0m  ' +
                    pad(session.userAgent, 9) +
                    '  ' +
                    '\x1b[94m' +
                    pad(page, 16) +
                    '\x1b[0m  ' +
                    '\x1b[32m' +
                    pad(String(cartCount), 4) +
                    '\x1b[0m  ' +
                    '\x1b[35m' +
                    pad(String(wishCount), 4) +
                    '\x1b[0m  ' +
                    '\x1b[34m' +
                    pad(String(viewCount), 4) +
                    '\x1b[0m  ' +
                    '\x1b[33m' +
                    pad(value, 9) +
                    '\x1b[0m ' +
                    '\x1b[36m║\x1b[0m',
            );

            // Zeige Warenkorb-Details wenn vorhanden
            if (session.cart.length > 0) {
                for (const item of session.cart.slice(0, 3)) {
                    const title = truncate(item.titel, 30);
                    const line =
                        '      └─ 🛒 ' +
                        title +
                        ' (' +
                        item.quantity +
                        'x ' +
                        item.preis.toFixed(2) +
                        '€)';
                    console.log(
                        '\x1b[36m║\x1b[0m\x1b[90m' +
                            pad(line, 76) +
                            '\x1b[0m\x1b[36m║\x1b[0m',
                    );
                }
                if (session.cart.length > 3) {
                    const moreText =
                        '         ... und ' +
                        (session.cart.length - 3) +
                        ' weitere';
                    console.log(
                        '\x1b[36m║\x1b[0m\x1b[90m' +
                            pad(moreText, 76) +
                            '\x1b[0m\x1b[36m║\x1b[0m',
                    );
                }
            }

            // Zeige zuletzt angesehenes Buch
            if (session.viewedBooks.length > 0) {
                const lastBook =
                    session.viewedBooks[session.viewedBooks.length - 1];
                const bookLine =
                    '      └─ 👁️ Zuletzt: ' + truncate(lastBook.title, 40);
                console.log(
                    '\x1b[36m║\x1b[0m\x1b[90m' +
                        pad(bookLine, 76) +
                        '\x1b[0m\x1b[36m║\x1b[0m',
                );
            }
        }
    }

    console.log(
        '\x1b[36m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m',
    );
    console.log(
        '\n\x1b[90mDrücke Strg+C zum Beenden • Updates erfolgen automatisch bei Änderungen\x1b[0m',
    );
}

function pad(str, len) {
    return str.length >= len
        ? str.substring(0, len)
        : str + ' '.repeat(len - str.length);
}

function truncate(str, len) {
    return str.length > len ? str.substring(0, len - 2) + '..' : str;
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\x1b[33m👋 Analytics Console beendet\x1b[0m');
    socket.disconnect();
    process.exit(0);
});
