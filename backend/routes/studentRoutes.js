const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all students
router.get('/', protect, async (req, res) => {
    try {
        // Find users with role Student
        const users = await User.find({ role: 'Student' }).select('-password');
        // For full details, would join with Student collection
        const studentsData = await Student.find().populate('userId').populate('batchIds').populate('parentId', 'name email');
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
        const { name, email, password, phone, enrollmentNo, dob, address, batchIds, parentId } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            // If User exists, check if they are already mapped to a Student profile
            const existingStudent = await Student.findOne({ userId: user._id });
            if (existingStudent || user.role !== 'Student') {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            // It's an orphaned User (created due to a previous student creation failure)
            await User.findByIdAndDelete(user._id);
        }

        const enrollmentExists = await Student.findOne({ enrollmentNo });
        if (enrollmentExists) return res.status(400).json({ message: 'Enrollment Number already exists' });

        try {
            // Create User first
            user = await User.create({ name, email, password, phone, role: 'Student' });

            // Then create Student profile
            const studentProfile = await Student.create({
                userId: user._id,
                enrollmentNo,
                dob,
                address,
                batchIds: batchIds || [],
                parentId: parentId === '' ? undefined : parentId
            });

            res.status(201).json({ user, studentProfile });
        } catch (error) {
            // Clean up the user if student profile creation fails
            if (user && user._id) {
                await User.findByIdAndDelete(user._id);
            }
            res.status(500).json({ message: error.message });
        }
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

        const { name, email, phone, enrollmentNo, dob, address, batchIds, password, parentId } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (password) user.password = password; // Assuming User model hashes password on save

        await user.save();

        if (enrollmentNo) student.enrollmentNo = enrollmentNo;
        if (dob) student.dob = dob;
        if (address) student.address = address;
        if (batchIds) student.batchIds = batchIds;
        if (parentId !== undefined) student.parentId = parentId === '' ? null : parentId; // Allow unlinking by sending empty string

        await student.save();

        res.json({ message: 'Student updated successfully', student, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete student
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete associated User account
        await User.findByIdAndDelete(student.userId);

        // Delete Student profile
        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
