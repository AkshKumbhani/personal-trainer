const db = require('../backend/config/db');

async function check() {
    try {
        const [rows] = await db.execute('SHOW TABLES LIKE "products"');
        console.log('Tables found:', rows);
        if (rows.length > 0) {
            const [cols] = await db.execute('DESCRIBE products');
            console.log('Columns:', cols);
        } else {
            console.log('Table "products" does not exist!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error checking DB:', err);
        process.exit(1);
    }
}

check();
