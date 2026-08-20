const Trainer = require('../models/Trainer');

exports.getAllTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.getAll();
        res.json({ success: true, trainers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
