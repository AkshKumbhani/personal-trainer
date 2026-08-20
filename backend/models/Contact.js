const db = require('../config/db');

class Contact {
    static async create(contactData) {
        const { name, email, subject, message } = contactData;
        const [result] = await db.execute(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC');
        return rows;
    }

    static async updateStatus(id, status) {
        await db.execute('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
    }

    static async delete(id) {
        await db.execute('DELETE FROM contacts WHERE id = ?', [id]);
    }
}

module.exports = Contact;
