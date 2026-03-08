const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all students
router.get('/', protect, admin, async (req, res) => {
    try {
        // Find users with role Student
        const users = await User.find({ role: 'Student' }).select('-password');
        // For full details, would join with Student collection
        const studentsData = await Student.find().populate('userId').populate('batchIds');
        res.json(studentsData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get current student profile
router.get('/me', protect, async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Only students have a student profile' });
        }
        let studentProfile = await Student.findOne({ userId: req.user._id }).populate('batchIds');
        if (!studentProfile) {
            studentProfile = await Student.create({
                userId: req.user._id,
                enrollmentNo: `ENR-${Date.now()}`,
                batchIds: []
            });
        }
        res.json(studentProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create student
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, email, password, phone, enrollmentNo, dob, address, batchIds } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Create User first
        const user = await User.create({ name, email, password, phone, role: 'Student' });

        // Then create Student profile
        const studentProfile = await Student.create({
            userId: user._id,
            enrollmentNo,
            dob,
            address,
            batchIds: batchIds || []
        });

        res.status(201).json({ user, studentProfile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Enroll student in a batch
router.post('/enroll', protect, async (req, res) => {
    try {
        const { batchId } = req.body;
        // Check if the user is a student
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Only students can enroll in batches' });
        }

        let student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            student = await Student.create({
                userId: req.user._id,
                enrollmentNo: `ENR-${Date.now()}`,
                batchIds: []
            });
        }

        // Check if already enrolled
        if (student.batchIds.includes(batchId)) {
            return res.status(400).json({ message: 'Already enrolled in this batch' });
        }

        student.batchIds.push(batchId);
        await student.save();

        res.json({ message: 'Successfully enrolled in batch', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update student
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const user = await User.findById(student.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, phone, enrollmentNo, dob, address, batchIds, password } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (password) user.password = password; // Assuming User model hashes password on save

        await user.save();

        if (enrollmentNo) student.enrollmentNo = enrollmentNo;
        if (dob) student.dob = dob;
        if (address) student.address = address;
        if (batchIds) student.batchIds = batchIds;

        await student.save();

        res.json({ message: 'Student updated successfully', student, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
