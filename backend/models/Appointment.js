const db = require('../config/db');

class Appointment {
    static async create(appointmentData) {
        const { user_id, service, duration, appointment_date, appointment_time, additional_info } = appointmentData;
        const [result] = await db.execute(
            'INSERT INTO appointments (user_id, service, duration, appointment_date, appointment_time, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, service, duration, appointment_date, appointment_time, additional_info]
        );
        return result.insertId;
    }

    static async findByUserId(user_id) {
        const [rows] = await db.execute(
            'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );
        return rows;
    }
}

module.exports = Appointment;
