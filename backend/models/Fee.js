const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    month: { type: String, required: true }, // e.g. "January 2025"
    dueAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
    paymentDate: { type: Date },
    receiptId: { type: String } // Unique generated ID on payment
}, { timestamps: true });

// Ensure unique fee record per student per batch per month
feeSchema.index({ studentId: 1, batchId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
