const db = require('../config/db');

class Product {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
        return rows;
    }

    static async getByCategory(category) {
        const [rows] = await db.execute('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC', [category]);
        return rows;
    }
}

module.exports = Product;
