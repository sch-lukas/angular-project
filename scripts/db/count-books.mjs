import { config as loadEnv } from 'dotenv';
import pkg from 'pg';

loadEnv();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;
const client = new Client({ connectionString });
try {
    await client.connect();
    const res = await client.query('SELECT COUNT(*) FROM buch.buch');
    console.log('Anzahl Bücher:', res.rows[0].count);
} catch (err) {
    console.error('Fehler:', err);
} finally {
    await client.end();
}
