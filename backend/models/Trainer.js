const db = require('../config/db');

class Trainer {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM trainers');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM trainers WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = Trainer;
