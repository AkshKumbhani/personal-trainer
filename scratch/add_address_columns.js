const db = require('../backend/config/db');

async function updateDB() {
    try {
        console.log('Adding address columns to users table...');
        const columns = [
            'country VARCHAR(50)',
            'address_line TEXT',
            'apartment VARCHAR(100)',
            'city VARCHAR(50)',
            'state VARCHAR(50)',
            'pin_code VARCHAR(20)'
        ];

        for (const col of columns) {
            try {
                const colName = col.split(' ')[0];
                await db.execute(`ALTER TABLE users ADD COLUMN ${col} AFTER role;`);
                console.log(`${colName} column added.`);
            } catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME') console.log(`${col.split(' ')[0]} already exists.`);
                else throw err;
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
