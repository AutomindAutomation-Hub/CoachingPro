const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const { protect, admin } = require('../middleware/authMiddleware');

// Get current system settings
router.get('/', protect, async (req, res) => {
    try {
        let settings = await SystemSettings.findOne().sort({ createdAt: -1 });
        if (!settings) {
            // Create default if none exists
            settings = await SystemSettings.create({});
        }
        res.json(settings);
    } catch (err) {
        console.error('Settings GET Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update system settings
router.post('/', protect, admin, async (req, res) => {
    try {
        console.log('Update Request Body:', req.body);
        const { brandingName, academicCycle, supportPhone, timezone } = req.body;

        let settings = await SystemSettings.findOne().sort({ createdAt: -1 });
        if (settings) {
            settings.brandingName = brandingName || settings.brandingName;
            settings.academicCycle = academicCycle || settings.academicCycle;
            settings.supportPhone = supportPhone || settings.supportPhone;
            settings.timezone = timezone || settings.timezone;
            settings.lastUpdatedBy = req.user._id;
            await settings.save();
        } else {
            settings = await SystemSettings.create({
                brandingName, academicCycle, supportPhone, timezone,
                lastUpdatedBy: req.user._id
            });
        }
        res.json(settings);
    } catch (err) {
        console.error('Settings POST Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
