const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all batches
router.get('/', protect, async (req, res) => {
    try {
        const batches = await Batch.find().populate('teacherId', 'name email');
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create batch
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, teacherId, timing, subject, monthlyFee } = req.body;
        const batch = await Batch.create({ name, teacherId, timing, subject, monthlyFee });
        res.status(201).json(batch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
