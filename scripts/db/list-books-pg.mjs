import { config as loadEnv } from 'dotenv';
import pkg from 'pg';

loadEnv();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
}

const client = new Client({ connectionString });
try {
    await client.connect();
    const query = `SELECT b.id, b.isbn, b.rating, b.preis, t.titel, t.untertitel
                   FROM buch.buch b
                   LEFT JOIN buch.titel t ON t.buch_id = b.id
                   ORDER BY b.id
                   LIMIT 10`;
    const res = await client.query(query);
    console.log(JSON.stringify(res.rows, null, 2));
} catch (err) {
    console.error('Fehler beim Abfragen der DB:', err);
    process.exitCode = 1;
} finally {
    await client.end();
}
