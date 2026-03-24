const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all batches
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Teacher') {
            query.teacherId = req.user._id;
        }
        // Use lean for performance as we don't need mongoose document functions
        const batches = await Batch.find(query)
            .populate('teacherId', 'name email')
            .lean();
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

// Update batch
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, teacherId, timing, subject, monthlyFee } = req.body;
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        batch.name = name || batch.name;
        batch.teacherId = teacherId || batch.teacherId;
        batch.timing = timing || batch.timing;
        batch.subject = subject || batch.subject;
        batch.monthlyFee = monthlyFee || batch.monthlyFee;

        const updatedBatch = await batch.save();
        res.json(updatedBatch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete batch
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        await Batch.findByIdAndDelete(req.params.id);
        res.json({ message: 'Batch removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
