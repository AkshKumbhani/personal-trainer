const db = require('../config/db');

class Plan {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM plans');
        return rows;
    }
}

module.exports = Plan;
