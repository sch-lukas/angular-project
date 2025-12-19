/**
 * Einfaches Script zum Generieren von Cover-Bildern
 * Nutzt pg direkt ohne Prisma
 */

import { createCanvas } from 'canvas';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cover-Design-Farben basierend auf Buchart
const COLORS = {
    EPUB: { bg: '#4A90E2', text: '#FFFFFF', accent: '#2E5C8A' },
    HARDCOVER: { bg: '#8B4513', text: '#FFFFFF', accent: '#654321' },
    PAPERBACK: { bg: '#48C774', text: '#FFFFFF', accent: '#2E7D4E' },
    DEFAULT: { bg: '#7C3AED', text: '#FFFFFF', accent: '#5B21B6' },
};

/**
 * Generiert ein Cover-Bild für ein Buch
 */
function generateCover(buch) {
    const width = 400;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Farben basierend auf Buchart
    const colors = COLORS[buch.art] || COLORS.DEFAULT;

    // Hintergrund - Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(1, colors.accent);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Dekorative Elemente
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.2;

    // Rahmen
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.globalAlpha = 1;

    // Titel
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';

    const titleText = buch.titel || 'Unbekannter Titel';
    const maxWidth = width - 80;
    const words = titleText.split(' ');
    let line = '';
    let y = 200;
    const lineHeight = 45;

    for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line.trim(), width / 2, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), width / 2, y);

    // Untertitel
    if (buch.untertitel) {
        ctx.font = '20px Arial';
        y += 40;
        ctx.fillText(buch.untertitel, width / 2, y);
    }

    // ISBN und Art
    ctx.font = '16px Arial';
    ctx.fillText(`ISBN: ${buch.isbn}`, width / 2, height - 120);

    if (buch.art) {
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = colors.accent;
        ctx.fillRect(width / 2 - 60, height - 90, 120, 30);
        ctx.fillStyle = colors.text;
        ctx.fillText(buch.art, width / 2, height - 68);
    }

    // Preis
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = colors.text;
    const preis = `€${Number.parseFloat(buch.preis).toFixed(2)}`;
    ctx.fillText(preis, width / 2, height - 30);

    return canvas;
}

/**
 * Hauptfunktion
 */
async function main() {
    const client = new Client({
        host: 'localhost',
        port: 5433,
        database: 'buch',
        user: 'buch',
        password: 'p',
    });

    try {
        await client.connect();
        console.log('🔍 Verbunden mit Datenbank...\n');

        // Hole alle Bücher mit Titeln
        const result = await client.query(`
            SELECT
                b.id,
                b.isbn,
                b.rating,
                b.art,
                b.preis,
                b.rabatt,
                b.lieferbar,
                t.titel,
                t.untertitel
            FROM buch.buch b
            LEFT JOIN buch.titel t ON b.id = t.buch_id
            ORDER BY b.id ASC
        `);

        const buecher = result.rows;
        console.log(`✅ ${buecher.length} Bücher gefunden\n`);

        // Erstelle Zielordner
        const coversDir = join(__dirname, '../frontend/src/assets/covers');
        await mkdir(coversDir, { recursive: true });
        console.log(`📁 Zielordner: ${coversDir}\n`);

        // Generiere Cover für jedes Buch
        let successCount = 0;
        let errorCount = 0;

        for (const buch of buecher) {
            try {
                const titelText = buch.titel || 'Unbekannt';
                console.log(
                    `🎨 Generiere Cover für Buch ${buch.id}: "${titelText}"`,
                );

                const canvas = generateCover(buch);
                const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });

                const filename = `${buch.id}.jpg`;
                const filepath = join(coversDir, filename);

                await writeFile(filepath, buffer);

                console.log(
                    `   ✅ Gespeichert: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`,
                );
                successCount++;
            } catch (err) {
                console.error(`   ❌ Fehler bei Buch ${buch.id}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 Zusammenfassung:`);
        console.log(`   ✅ Erfolgreich: ${successCount}`);
        console.log(`   ❌ Fehler: ${errorCount}`);
        console.log(`   📁 Speicherort: ${coversDir}`);
        console.log(`${'='.repeat(60)}\n`);
    } catch (err) {
        console.error('❌ Fehler:', err);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

await main();
