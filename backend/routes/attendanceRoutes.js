const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const sendSMS = require('../utils/sendSMS');
const { protect } = require('../middleware/authMiddleware');

// Get attendance for a batch on a specific date
router.get('/:batchId/:date', protect, async (req, res) => {
    try {
        const { batchId, date } = req.params;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const records = await Attendance.find({
            batchId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('studentId', 'name email');
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark bulk attendance
router.post('/bulk', protect, async (req, res) => {
    try {
        const { batchId, date, attendanceData } = req.body;
        // attendanceData is an array: [{ studentId: '...', status: 'Present' }, ...]

        let savedRecords = [];

        for (const record of attendanceData) {
            // Find existing record
            let att = await Attendance.findOne({
                studentId: record.studentId,
                batchId,
                date: new Date(date)
            });

            if (att) {
                att.status = record.status;
                att.markedBy = req.user._id;
                await att.save();
            } else {
                att = await Attendance.create({
                    studentId: record.studentId,
                    batchId,
                    date: new Date(date),
                    status: record.status,
                    markedBy: req.user._id
                });
            }

            savedRecords.push(att);

            // Trigger SMS if Absent
            if (record.status === 'Absent') {
                // Fetch parent details
                const student = await Student.findOne({ userId: record.studentId }).populate('parentId');
                const userStudent = await User.findById(record.studentId);

                // Either notify parent or student
                const phoneToNotify = student?.parentId?.phone || userStudent?.phone;

                await sendSMS(
                    phoneToNotify,
                    `Notice: Your ward ${userStudent.name} was marked ABSENT today for their batch. Please contact the coaching institute.`
                );
            }
        }

        res.status(200).json({ message: 'Attendance processed successfully', count: savedRecords.length });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate attendance entries found' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});

// Scan QR Code to mark attendance
router.post('/scan', protect, async (req, res) => {
    try {
        const { studentId, batchId } = req.body; // QR content might be stringified JSON
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let att = await Attendance.findOne({
            studentId,
            batchId,
            date: today
        });

        if (att) {
            return res.status(200).json({ message: 'Attendance already marked as ' + att.status, status: att.status });
        }

        att = await Attendance.create({
            studentId,
            batchId,
            date: today,
            status: 'Present',
            markedBy: req.user._id
        });

        res.status(201).json({ message: 'Attendance marked Present via QR!', attendance: att });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
