const Plan = require('../models/Plan');

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.getAll();
        res.json({ success: true, plans });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
