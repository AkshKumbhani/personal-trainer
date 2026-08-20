const db = require('../backend/config/db');

async function testPlanCRUD() {
    try {
        console.log('--- Testing Plan CRUD ---');
        
        // 1. Add Plan
        const testPlan = {
            name: 'Test Elite Plan',
            price: 99.99,
            duration: 'Quarterly',
            description: 'This is a test description for the elite plan.',
            features: ['Test Feature 1', 'Test Feature 2']
        };
        
        console.log('Adding plan...');
        const [insertRes] = await db.execute(
            'INSERT INTO plans (name, price, duration, description, features) VALUES (?, ?, ?, ?, ?)', 
            [testPlan.name, testPlan.price, testPlan.duration, testPlan.description, JSON.stringify(testPlan.features)]
        );
        const planId = insertRes.insertId;
        console.log(`Plan added with ID: ${planId}`);
        
        // 2. Get Plan
        const [rows] = await db.execute('SELECT * FROM plans WHERE id = ?', [planId]);
        console.log('Fetched plan:', rows[0]);
        
        if (rows[0].description !== testPlan.description) {
            throw new Error('Description mismatch');
        }
        
        // 3. Update Plan
        const updatedDesc = 'Updated test description.';
        console.log('Updating plan...');
        await db.execute(
            'UPDATE plans SET description = ? WHERE id = ?',
            [updatedDesc, planId]
        );
        
        const [updatedRows] = await db.execute('SELECT * FROM plans WHERE id = ?', [planId]);
        console.log('Updated description:', updatedRows[0].description);
        
        if (updatedRows[0].description !== updatedDesc) {
            throw new Error('Update failed');
        }
        
        // 4. Delete Plan
        console.log('Deleting plan...');
        await db.execute('DELETE FROM plans WHERE id = ?', [planId]);
        console.log('Plan deleted.');
        
        console.log('--- Plan CRUD Test Success ---');
    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        process.exit();
    }
}

testPlanCRUD();
