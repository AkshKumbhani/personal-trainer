const db = require('../config/db');

class User {
    static async create(userData) {
        const { first_name, last_name, email, password, google_id, role = 'user' } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (first_name, last_name, email, password, google_id, role) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, password, google_id, role]
        );
        return result.insertId;
    }

    static async findByGoogleId(googleId) {
        const [rows] = await db.execute('SELECT * FROM users WHERE google_id = ?', [googleId]);
        return rows[0];
    }

    static async updateGoogleId(id, googleId) {
        await db.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, id]);
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async updateOTP(userId, otp, expiry) {
        await db.execute('UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, expiry, userId]);
    }

    static async verifyOTP(userId, otp) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expiry > NOW()',
            [userId, otp]
        );
        return rows[0];
    }

    static async clearOTP(userId) {
        await db.execute('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?', [userId]);
    }

    static async updateAddress(userId, addressData) {
        const { country, address_line, apartment, city, state, pin_code } = addressData;
        await db.execute(
            'UPDATE users SET country = ?, address_line = ?, apartment = ?, city = ?, state = ?, pin_code = ? WHERE id = ?',
            [country, address_line, apartment, city, state, pin_code, userId]
        );
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT id, first_name, last_name, email, role, country, address_line, apartment, city, state, pin_code, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = User;
