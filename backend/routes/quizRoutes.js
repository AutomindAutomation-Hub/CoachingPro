const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/authMiddleware');

// Get all quizzes for a batch
router.get('/batch/:batchId', protect, async (req, res) => {
    try {
        // If student, don't return correctAnswer to prevent cheating
        const quizzes = await Quiz.find({ batchId: req.params.batchId })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // We shouldn't send answers to students unless they already submitted
        const isStudent = req.user.role === 'Student';

        const sanitizedQuizzes = quizzes.map(q => {
            const quizObj = q.toObject();
            if (isStudent) {
                const hasSubmitted = quizObj.results?.some(r => r.studentId.toString() === req.user._id.toString());
                if (!hasSubmitted) {
                    // remove correct answers for active/unattempted quizzes
                    quizObj.questions.forEach(question => delete question.correctAnswer);
                }
            }
            return quizObj;
        });

        res.json({ quizzes: sanitizedQuizzes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Quiz
router.post('/', protect, async (req, res) => {
    try {
        const { title, batchId, durationMinutes, questions } = req.body;
        const newQuiz = await Quiz.create({
            title,
            batchId,
            durationMinutes,
            questions,
            createdBy: req.user._id
        });
        res.status(201).json(newQuiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit Quiz
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body; // { questionId: "selected Option" }
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Ensure not submitted before
        const alreadySubmitted = quiz.results?.find(r => r.studentId.toString() === req.user._id.toString());
        if (alreadySubmitted) return res.status(400).json({ message: 'Quiz already submitted' });

        let score = 0;
        quiz.questions.forEach(q => {
            if (answers[q._id] === q.correctAnswer) {
                score++;
            }
        });

        const percentScore = (score / quiz.questions.length) * 100;

        quiz.results.push({
            studentId: req.user._id,
            score: percentScore
        });

        await quiz.save();
        res.json({ score: percentScore, message: 'Quiz submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get quizzes for a specific student (for progress tracking)
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        // Find quizzes where the student has submitted a result
        const quizzes = await Quiz.find({ 'results.studentId': req.params.studentId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
