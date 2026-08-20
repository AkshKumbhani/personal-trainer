const Appointment = require('../models/Appointment');

exports.bookAppointment = async (req, res) => {
    try {
        const { service, duration, appointment_date, appointment_time, additional_info } = req.body;

        const appointmentId = await Appointment.create({
            user_id: req.user.id,
            service,
            duration,
            appointment_date,
            appointment_time,
            additional_info
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointmentId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findByUserId(req.user.id);
        res.json({ success: true, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
