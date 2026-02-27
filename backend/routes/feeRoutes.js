const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const User = require('../models/User');
const Batch = require('../models/Batch');
const { protect, admin } = require('../middleware/authMiddleware');

// Get default summary grouped by batches or get all fee records
router.get('/', protect, admin, async (req, res) => {
    try {
        const { status, month, batchId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (month) query.month = month;
        if (batchId) query.batchId = batchId;

        const fees = await Fee.find(query)
            .populate('studentId', 'name phone')
            .populate('batchId', 'name monthlyFee')
            .sort({ dueDate: 1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate Fee records (usually run monthly via cron, manually triggered for now)
router.post('/generate', protect, admin, async (req, res) => {
    try {
        const { batchId, month, dueDate } = req.body;

        // Get batch default fee
        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        // Find all students in this batch
        const students = await Student.find({ batchIds: batchId });
        if (students.length === 0) return res.status(400).json({ message: 'No students in this batch' });

        let createdCount = 0;
        for (let student of students) {
            try {
                await Fee.create({
                    studentId: student.userId,
                    batchId,
                    month,
                    dueAmount: batch.monthlyFee,
                    dueDate
                });
                createdCount++;
            } catch (err) {
                // Ignore duplicate error, it means fee is already generated
            }
        }

        res.status(201).json({ message: `Successfully generated ${createdCount} fee records` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark Fee as Paid
router.put('/:id/pay', protect, admin, async (req, res) => {
    try {
        const { amountPaid } = req.body; // could be partial or full
        const fee = await Fee.findById(req.params.id);

        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        fee.paidAmount += Number(amountPaid);

        if (fee.paidAmount >= fee.dueAmount) {
            fee.status = 'Paid';
        } else {
            fee.status = 'Partial';
        }

        fee.paymentDate = new Date();
        fee.receiptId = `REC-${Date.now()}`;

        await fee.save();

        res.json({ message: 'Payment recorded', fee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get specific student's fees (For Student/Parent dashboard)
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const fees = await Fee.find({ studentId: req.params.studentId })
            .populate('batchId', 'name')
            .sort({ dueDate: -1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Mock Online Payment (Student/Parent)
router.post('/:id/pay-online', protect, async (req, res) => {
    try {
        const { amountPaid } = req.body;
        const fee = await Fee.findById(req.params.id);

        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        // Security check: ensure the user paying is the student or their parent
        if (req.user.role === 'Student' && fee.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to pay this fee' });
        }

        if (req.user.role === 'Parent') {
            // Need to check if this fee belongs to one of their children
            const children = await Student.find({ parentId: req.user._id });
            const childIds = children.map(c => c.userId.toString());
            if (!childIds.includes(fee.studentId.toString())) {
                return res.status(403).json({ message: 'Not authorized to pay this fee' });
            }
        }

        fee.paidAmount += Number(amountPaid);

        if (fee.paidAmount >= fee.dueAmount) {
            fee.status = 'Paid';
        } else {
            fee.status = 'Partial';
        }

        fee.paymentDate = new Date();
        fee.receiptId = `TXN-${Date.now()}`;

        await fee.save();

        res.json({ message: 'Payment successful', fee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
