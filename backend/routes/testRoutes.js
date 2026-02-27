const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all tests for a specific batch
router.get('/:batchId', protect, async (req, res) => {
    try {
        const tests = await Test.find({ batchId: req.params.batchId })
            .populate('results.studentId', 'name email')
            .sort({ date: -1 });
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a test / enter offline marks
router.post('/', protect, async (req, res) => {
    try {
        const { batchId, testName, date, maxMarks, results } = req.body;
        // results is expected to be array of: { studentId, marksObtained (if any) }

        // Auto-populate results with 0 marks and 'Present' if not provided explicitly,
        // although client should ideally send the full roster format.
        const newTest = await Test.create({
            batchId,
            testName,
            date,
            maxMarks,
            results: results || [],
            createdBy: req.user._id
        });

        res.status(201).json(newTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update marks for a test
router.put('/:id', protect, async (req, res) => {
    try {
        const { results } = req.body;
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        test.results = results; // Replace with updated results
        await test.save();

        res.json({ message: 'Marks updated successfully', test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Student specific: Get tests for a specific student id
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const tests = await Test.find({ "results.studentId": req.params.studentId })
            .select('testName date maxMarks results batchId')
            .populate('batchId', 'name subject')
            .sort({ date: 1 }); // Sort ascending for graphing
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
