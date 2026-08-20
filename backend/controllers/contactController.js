const Contact = require('../models/Contact');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        await Contact.create({ name, email, subject, message });
        res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.getAll();
        res.json({ success: true, contacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        await Contact.delete(req.params.id);
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
