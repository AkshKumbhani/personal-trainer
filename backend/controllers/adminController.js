const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { storeImage } = require('../services/imageStorage');

exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalAppointments }]] = await db.execute('SELECT COUNT(*) as totalAppointments FROM appointments');
        const [[{ confirmedAppointments }]] = await db.execute("SELECT COUNT(*) as confirmedAppointments FROM appointments WHERE status = 'confirmed'");
        const [[{ pendingAppointments }]] = await db.execute("SELECT COUNT(*) as pendingAppointments FROM appointments WHERE status = 'pending'");

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalAppointments,
                confirmedAppointments,
                pendingAppointments
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, u.first_name, u.last_name, u.email 
            FROM appointments a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC
        `);
        res.json({ success: true, appointments: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        await db.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};
// Trainer Management
exports.addTrainer = async (req, res) => {
    try {
        console.log('addTrainer body:', req.body);
        console.log('addTrainer file:', req.file);

        const { name, specialty, description } = req.body;

        
        if (!name || !specialty) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let image_url = req.body.image_url || '/uploads/default-trainer.png';

        if (req.file) image_url = await storeImage(req.file, 'trainers');

        await db.execute('INSERT INTO trainers (name, specialty, image_url, description) VALUES (?, ?, ?, ?)', 
            [name, specialty, image_url, description]);
        
        res.json({ success: true, message: 'Trainer added successfully' });
    } catch (err) {
        console.error('Add Trainer Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.updateTrainer = async (req, res) => {
    try {
        console.log('updateTrainer body:', req.body);
        console.log('updateTrainer file:', req.file);

        const { id, name, specialty, description } = req.body;

        
        if (!id || !name || !specialty) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let image_url = req.body.image_url;

        if (req.file) image_url = await storeImage(req.file, 'trainers');

        await db.execute('UPDATE trainers SET name = ?, specialty = ?, image_url = ?, description = ? WHERE id = ?', 
            [name, specialty, image_url, description, id]);
            
        res.json({ success: true, message: 'Trainer updated successfully' });
    } catch (err) {
        console.error('Update Trainer Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.deleteTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM trainers WHERE id = ?', [id]);
        res.json({ success: true, message: 'Trainer deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

// Plan Management
exports.addPlan = async (req, res) => {
    try {
        const { name, price, duration, features, description } = req.body;
        await db.execute('INSERT INTO plans (name, price, duration, description, features) VALUES (?, ?, ?, ?, ?)', 
            [name, price, duration, description, JSON.stringify(features)]);
        res.json({ success: true, message: 'Plan added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { id, name, price, duration, features, description } = req.body;
        await db.execute('UPDATE plans SET name = ?, price = ?, duration = ?, description = ?, features = ? WHERE id = ?', 
            [name, price, duration, description, JSON.stringify(features), id]);
        res.json({ success: true, message: 'Plan updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM plans WHERE id = ?', [id]);
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.getAllTrainers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM trainers');
        res.json({ success: true, trainers: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM plans');
        res.json({ success: true, plans: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

// Product Management
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ success: true, products: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        console.log('addProduct body:', req.body);
        console.log('addProduct file:', req.file);

        const { name, price, category, description } = req.body;

        
        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let image_url = req.body.image_url || ''; // Fallback

        if (req.file) image_url = await storeImage(req.file, 'products');
        
        await db.execute('INSERT INTO products (name, price, category, image_url, description) VALUES (?, ?, ?, ?, ?)', 
            [name, price, category, image_url, description]);
        
        res.json({ success: true, message: 'Product added successfully' });
    } catch (err) {
        console.error('Add Product Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log('updateProduct body:', req.body);
        console.log('updateProduct file:', req.file);

        const { id, name, price, category, description } = req.body;

        
        if (!id || !name || !price || !category) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let image_url = req.body.image_url || '';

        if (req.file) image_url = await storeImage(req.file, 'products');
        
        await db.execute('UPDATE products SET name = ?, price = ?, category = ?, image_url = ?, description = ? WHERE id = ?', 
            [name, price, category, image_url, description, id]);
            
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (err) {
        console.error('Update Product Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};
