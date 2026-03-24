const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    timing: { type: String, required: true },
    subject: { type: String, required: true },
    monthlyFee: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
