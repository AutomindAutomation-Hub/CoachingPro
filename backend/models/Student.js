const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrollmentNo: { type: String, unique: true, required: true },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    dob: { type: Date },
    address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
