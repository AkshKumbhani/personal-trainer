const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, appointmentController.bookAppointment);
router.get('/my', authMiddleware, appointmentController.getMyAppointments);

module.exports = router;
