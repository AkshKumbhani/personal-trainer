const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public route
router.post('/submit', contactController.submitContact);

// Admin routes (Protected by session in frontend)
router.get('/admin/all', adminMiddleware, contactController.getContacts);
router.delete('/admin/:id', adminMiddleware, contactController.deleteContact);

module.exports = router;
