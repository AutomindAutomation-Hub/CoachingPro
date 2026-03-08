const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all teachers
router.get('/', protect, admin, async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Teacher' }).select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a teacher
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const teacher = await User.create({ name, email, password, phone, role: 'Teacher' });
        res.status(201).json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get batches for logged in teacher
router.get('/my-batches', protect, async (req, res) => {
    try {
        if (req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Only teachers can access this route' });
        }
        const Batch = require('../models/Batch');
        const batches = await Batch.find({ teacherId: req.user._id });
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a teacher
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        if (!teacher || teacher.role !== 'Teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const { name, email, phone, password } = req.body;

        if (name) teacher.name = name;
        if (email) teacher.email = email;
        if (phone) teacher.phone = phone;
        if (password) teacher.password = password;

        await teacher.save();

        res.json({ message: 'Teacher updated successfully', teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
