#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';

const log = (...args) => console.log('[add-cover-abbildungen]', ...args);

async function main() {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
        console.error('DATABASE_URL fehlt');
        process.exit(1);
    }
    const client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
        const books = await client.query(
            'SELECT id FROM buch.buch ORDER BY id ASC',
        );
        let inserted = 0;
        for (const row of books.rows) {
            const { id } = row;
            const exists = await client.query(
                'SELECT 1 FROM buch.abbildung WHERE buch_id=$1 LIMIT 1',
                [id],
            );
            if (exists.rowCount > 0) continue;
            const pfad = `assets/covers/${id}.svg`;
            await client.query(
                'INSERT INTO buch.abbildung(beschriftung, content_type, pfad, buch_id) VALUES($1,$2,$3,$4)',
                ['Cover', 'image/svg+xml', pfad, id],
            );
            inserted++;
            log('Abbildung angelegt für Buch', id, pfad);
        }
        log('Fertig. Neu angelegte Abbildungen:', inserted);
    } finally {
        await client.end();
    }
}

try {
    await main();
} catch (err) {
    console.error('Fehler:', err);
    process.exit(1);
}
