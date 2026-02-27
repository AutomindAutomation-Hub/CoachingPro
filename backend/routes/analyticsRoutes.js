const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, async (req, res) => {
    try {
        // 1. Total Active Students
        const totalStudents = await Student.countDocuments();

        // 2. Expected vs Collected Revenue (Current Month)
        const currentMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

        // Aggregate over Fees
        const feeStats = await Fee.aggregate([
            { $match: { month: { $regex: new RegExp(new Date().getFullYear().toString()) } } }, // rough match for year
            {
                $group: {
                    _id: "$month",
                    expected: { $sum: "$dueAmount" },
                    collected: { $sum: "$paidAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Overall Attendance Average
        const attendanceStats = await Attendance.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        let present = 0, absent = 0;
        attendanceStats.forEach(stat => {
            if (stat._id === 'Present' || stat._id === 'Late') present += stat.count;
            if (stat._id === 'Absent') absent += stat.count;
        });

        const totalRecords = present + absent;
        const avgAttendance = totalRecords > 0 ? ((present / totalRecords) * 100).toFixed(1) : 0;

        res.json({
            totalStudents,
            avgAttendance,
            feeStats, // array of { _id: 'March 2026', expected: 5000, collected: 2000 }
            currentMonth: currentMonthLabel
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
