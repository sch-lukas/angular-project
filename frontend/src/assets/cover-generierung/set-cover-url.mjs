// Script: set-cover-url.mjs
// Zweck: cover_url in Tabelle buch.buch auf Pfade zu generierten SVGs setzen
// Pfad-Schema: assets/covers/<id>.svg (vom Angular-Frontend nutzbar)
// Aufruf: node --env-file=.env frontend/src/assets/cover-generierung/set-cover-url.mjs

import pg from 'pg';

const { Client } = pg;

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('🔌 Verbunden. Setze cover_url falls leer...');
    const updateSql = `UPDATE buch.buch SET cover_url = 'assets/covers/' || id || '.svg' WHERE cover_url IS NULL;`;
    const res = await client.query(updateSql);
    console.log(`✅ Aktualisiert: ${res.rowCount} Einträge`);
    // Stichprobe holen
    const sample = await client.query(
        'SELECT id, cover_url FROM buch.buch ORDER BY id ASC LIMIT 5',
    );
    for (const row of sample.rows) {
        console.log(`   • Buch ${row.id}: ${row.cover_url}`);
    }
    await client.end();
    console.log('🏁 Fertig.');
}

try {
    await main();
} catch (err) {
    console.error('❌ Fehler beim Setzen der Cover-URLs:', err);
    process.exit(1);
}
