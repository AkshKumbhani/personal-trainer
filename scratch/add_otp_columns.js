const db = require('../backend/config/db');

async function updateDB() {
    try {
        console.log('Adding OTP columns to users table...');
        try {
            await db.execute('ALTER TABLE users ADD COLUMN otp VARCHAR(6) AFTER google_id;');
            console.log('otp column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('otp column already exists.');
            else throw err;
        }

        try {
            await db.execute('ALTER TABLE users ADD COLUMN otp_expiry DATETIME AFTER otp;');
            console.log('otp_expiry column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('otp_expiry column already exists.');
            else throw err;
        }
        
        console.log('Database update successful!');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        process.exit();
    }
}

updateDB();
