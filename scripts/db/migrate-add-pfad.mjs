#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';

const log = (...args) => console.log('[migrate-add-pfad]', ...args);

async function main() {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
        console.error('DATABASE_URL fehlt');
        process.exit(1);
    }
    const client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
        log('Prüfe Spalte pfad in buch.abbildung …');
        const check = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_schema='buch' AND table_name='abbildung' AND column_name='pfad'",
        );
        if (check.rowCount === 0) {
            log('Spalte pfad fehlt – füge hinzu …');
            await client.query(
                'ALTER TABLE buch.abbildung ADD COLUMN pfad text',
            );
            log('Spalte pfad hinzugefügt.');
        } else {
            log('Spalte pfad bereits vorhanden.');
        }
    } finally {
        await client.end();
    }
}

try {
    await main();
} catch (err) {
    console.error('Migration fehlgeschlagen:', err);
    process.exit(1);
}
