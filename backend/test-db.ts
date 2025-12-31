import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Successfully connected to PostgreSQL!');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

testConnection();
