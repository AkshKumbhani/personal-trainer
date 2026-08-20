const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function bootstrapDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
        multipleStatements: true
    });

    try {
        const schema = fs.readFileSync(path.join(__dirname, '..', 'db_setup.sql'), 'utf8');
        await connection.query(schema);
        console.log(`Database setup complete: ${process.env.DB_NAME}`);
    } finally {
        await connection.end();
    }
}

bootstrapDatabase().catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
});
