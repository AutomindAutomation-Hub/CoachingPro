const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    testName: { type: String, required: true },
    date: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    results: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        marksObtained: { type: Number, default: 0 },
        status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
