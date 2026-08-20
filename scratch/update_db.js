const db = require('../backend/config/db');

async function updateDB() {
    try {
        console.log('Updating users table...');
        await db.execute('ALTER TABLE users MODIFY password VARCHAR(255) NULL;');
        console.log('Password made nullable.');
        
        try {
            await db.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER email;');
            console.log('google_id column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log('google_id column already exists.');
            } else {
                throw err;
            }
        }
        
        console.log('Database update successful!');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        process.exit();
    }
}

updateDB();
