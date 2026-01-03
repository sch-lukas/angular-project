#!/usr/bin/env node
/**
 * Start-Script für Angular Dev Server
 *
 * Verwendung:
 *   node start-server.mjs            → Nur localhost (Standard)
 *   node start-server.mjs --lan      → LAN-Modus (von anderen Geräten erreichbar)
 *   node start-server.mjs --tunnel   → Tunnel-Modus (für Cloudflare Tunnel)
 *
 * Oder über npm/pnpm:
 *   pnpm start                       → Nur localhost
 *   pnpm start:lan                   → LAN-Modus
 *   pnpm start:tunnel                → Tunnel-Modus
 */

import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';

// Konfiguration
const CONFIG = {
    port: 4200,
    sslKey: '../src/config/resources/tls/key.pem',
    sslCert: '../src/config/resources/tls/certificate.crt',
    proxyConfig: 'proxy.conf.json',
};

// Prüfe Flags
const isLanMode = process.argv.includes('--lan');
const isTunnelMode = process.argv.includes('--tunnel');

// Basis-Argumente für ng serve
const args = [
    'serve',
    '--ssl',
    '--ssl-key',
    CONFIG.sslKey,
    '--ssl-cert',
    CONFIG.sslCert,
    '--proxy-config',
    CONFIG.proxyConfig,
    '--port',
    CONFIG.port.toString(),
];

// Tunnel-Modus: Host-Check deaktivieren für Cloudflare Tunnel
if (isTunnelMode) {
    args.push('--disable-host-check');

    console.log('\n🌐 TUNNEL-MODUS AKTIVIERT');
    console.log('━'.repeat(50));
    console.log('Host-Check deaktiviert für Cloudflare Tunnel.');
    console.log(`Server läuft auf: https://localhost:${CONFIG.port}`);
    console.log('━'.repeat(50) + '\n');
}
// Im LAN-Modus: Host auf 0.0.0.0 setzen
else if (isLanMode) {
    args.push('--host', '0.0.0.0');
    args.push('--disable-host-check');

    console.log('\n🌐 LAN-MODUS AKTIVIERT');
    console.log('━'.repeat(50));
    console.log('Der Server ist von anderen Geräten im Netzwerk erreichbar.\n');

    // Zeige alle verfügbaren IP-Adressen
    const interfaces = networkInterfaces();
    const addresses = [];

    for (const [name, nets] of Object.entries(interfaces)) {
        for (const net of nets || []) {
            // Nur IPv4 und keine internen Adressen
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push({ name, address: net.address });
            }
        }
    }

    if (addresses.length > 0) {
        console.log('📱 Erreichbar unter:');
        console.log(`   https://localhost:${CONFIG.port} (dieses Gerät)`);
        for (const { name, address } of addresses) {
            console.log(`   https://${address}:${CONFIG.port} (${name})`);
        }
        console.log(
            '\n⚠️  Hinweis: Browser wird SSL-Warnung zeigen (selbstsigniertes Zertifikat)',
        );
        console.log('━'.repeat(50) + '\n');
    }
} else {
    console.log('\n🏠 LOCALHOST-MODUS (Standard)');
    console.log('━'.repeat(50));
    console.log(
        `Server nur auf diesem Gerät erreichbar: https://localhost:${CONFIG.port}`,
    );
    console.log('Für LAN-Zugriff: pnpm start:lan');
    console.log('━'.repeat(50) + '\n');
}

// Starte ng serve
const isWindows = process.platform === 'win32';

// Verwende shell: true auf Windows für korrektes npx Handling
const ngProcess = spawn('npx', ['ng', ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: isWindows,
});

ngProcess.on('error', (err) => {
    console.error('❌ Fehler beim Starten:', err.message);
    process.exit(1);
});

ngProcess.on('close', (code) => {
    process.exit(code || 0);
});
