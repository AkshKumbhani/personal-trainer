const db = require('../backend/config/db');

async function setupContactTable() {
    try {
        console.log('Creating contacts table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(200),
                message TEXT NOT NULL,
                status ENUM('new', 'read', 'replied') DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Contacts table created successfully!');
    } catch (err) {
        console.error('Error creating contacts table:', err);
    } finally {
        process.exit();
    }
}

setupContactTable();
