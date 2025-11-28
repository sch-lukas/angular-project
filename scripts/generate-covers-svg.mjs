/**
 * Script zum Generieren von Cover-Bildern (SVG) für alle Bücher
 * Speichert die Bilder in frontend/src/assets/covers/ mit dem Dateinamen: {id}.svg
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cover-Design-Farben basierend auf Buchart
const COLORS = {
    EPUB: { bg: '#4A90E2', accent: '#2E5C8A' },
    HARDCOVER: { bg: '#8B4513', accent: '#654321' },
    PAPERBACK: { bg: '#48C774', accent: '#2E7D4E' },
    DEFAULT: { bg: '#7C3AED', accent: '#5B21B6' },
};

/**
 * Generiert ein SVG Cover für ein Buch
 */
function generateSVGCover(buch) {
    const width = 300;
    const height = 450;
    const colors = COLORS[buch.art] || COLORS.DEFAULT;

    const titel = (buch.titel || 'Unbekannter Titel')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

    const untertitel = buch.untertitel
        ? buch.untertitel
              .replaceAll('&', '&amp;')
              .replaceAll('<', '&lt;')
              .replaceAll('>', '&gt;')
        : '';

    const rating = buch.rating || 0;
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const preis = `€${Number.parseFloat(buch.preis).toFixed(2)}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${buch.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Hintergrund -->
  <rect width="${width}" height="${height}" fill="url(#grad${buch.id})"/>

  <!-- Dekorative Rahmen -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}"
        fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
  <rect x="30" y="30" width="${width - 60}" height="${height - 60}"
        fill="none" stroke="#ffffff" stroke-width="1" opacity="0.3"/>

  <!-- Titel -->
  <text x="${width / 2}" y="140"
        font-family="Arial, sans-serif"
        font-size="28"
        font-weight="bold"
        fill="#ffffff"
        text-anchor="middle">
    ${titel.length > 20 ? titel.substring(0, 20) + '...' : titel}
  </text>

  ${
      untertitel
          ? `<text x="${width / 2}" y="180"
            font-family="Arial, sans-serif"
            font-size="16"
            fill="#ffffff"
            text-anchor="middle"
            opacity="0.9">
      ${untertitel.length > 30 ? untertitel.substring(0, 30) + '...' : untertitel}
    </text>`
          : ''
  }

  <!-- Rating -->
  <text x="${width / 2}" y="240"
        font-family="Arial, sans-serif"
        font-size="24"
        fill="#FFD700"
        text-anchor="middle">
    ${stars}
  </text>

  <!-- Buchart Badge -->
  ${
      buch.art
          ? `
  <rect x="${width / 2 - 50}" y="280" width="100" height="30"
        fill="${colors.accent}" rx="4"/>
  <text x="${width / 2}" y="302"
        font-family="Arial, sans-serif"
        font-size="16"
        font-weight="bold"
        fill="#ffffff"
        text-anchor="middle">
    ${buch.art}
  </text>
  `
          : ''
  }

  <!-- ISBN -->
  <text x="${width / 2}" y="350"
        font-family="Arial, sans-serif"
        font-size="14"
        fill="#ffffff"
        text-anchor="middle"
        opacity="0.8">
    ISBN: ${buch.isbn}
  </text>

  <!-- Preis -->
  <text x="${width / 2}" y="400"
        font-family="Arial, sans-serif"
        font-size="32"
        font-weight="bold"
        fill="#ffffff"
        text-anchor="middle">
    ${preis}
  </text>
</svg>`;
}

/**
 * Hauptfunktion
 */
async function main() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
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

                const svg = generateSVGCover(buch);

                const filename = `${buch.id}.svg`;
                const filepath = join(coversDir, filename);

                await writeFile(filepath, svg, 'utf-8');

                console.log(
                    `   ✅ Gespeichert: ${filename} (${(svg.length / 1024).toFixed(1)} KB)`,
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
