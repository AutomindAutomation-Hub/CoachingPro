const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true } // should exactly match one of the options
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    durationMinutes: { type: Number, required: true },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
    results: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number },
        submittedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
