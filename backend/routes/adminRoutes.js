const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../config/uploadConfig');
const adminMiddleware = require('../middleware/adminMiddleware');

// In a real app, you'd add admin-check middleware here.
// For now, these are open routes for the admin dashboard.

router.use(adminMiddleware);

router.get('/stats', adminController.getDashboardStats);
router.get('/appointments', adminController.getAllAppointments);
router.get('/users', adminController.getAllUsers);
router.post('/appointments/status', adminController.updateAppointmentStatus);

// Trainer Management
router.get('/trainers', adminController.getAllTrainers);
router.post('/trainers', upload.single('trainerImage'), adminController.addTrainer);
router.put('/trainers', upload.single('trainerImage'), adminController.updateTrainer);
router.delete('/trainers/:id', adminController.deleteTrainer);

// Plan Management
router.get('/plans', adminController.getAllPlans);
router.post('/plans', adminController.addPlan);
router.put('/plans', adminController.updatePlan);
router.delete('/plans/:id', adminController.deletePlan);

// Product Management
router.get('/products', adminController.getAllProducts);
router.post('/products', upload.single('productImage'), adminController.addProduct);
router.put('/products', upload.single('productImage'), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

module.exports = router;
