import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { BrainCircuit, Clock, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Quizzes = () => {
    const { user } = useAuthStore();
    const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin';
    const isStudent = user?.role === 'Student';

    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Creator State
    const [showCreator, setShowCreator] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDuration, setNewDuration] = useState(15);
    const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);

    // Taker State
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({}); // { questionId: "Option Text" }
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        axios.get('/batches').then(res => setBatches(res.data));
    }, []);

    useEffect(() => {
        if (!selectedBatch) return;
        fetchQuizzes();
    }, [selectedBatch]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/quizzes/batch/${selectedBatch}`);
            setQuizzes(data.quizzes);
        } catch (err) {
            console.error('Fetch err', err);
        }
        setLoading(false);
    };

    // --- Creator Logic ---
    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/quizzes', {
                title: newTitle,
                batchId: selectedBatch,
                durationMinutes: newDuration,
                questions
            });
            setShowCreator(false);
            setNewTitle('');
            setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
            fetchQuizzes();
        } catch (err) {
            alert('Failed to create quiz: ' + err.message);
        }
    };

    // --- Taker Logic ---
    const startQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setStudentAnswers({});
        setTimeLeft(quiz.durationMinutes * 60); // Convert to seconds
    };

    useEffect(() => {
        if (!activeQuiz || timeLeft <= 0) {
            if (activeQuiz && timeLeft <= 0) submitQuiz(); // Auto submit
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [activeQuiz, timeLeft]);

    const submitQuiz = async () => {
        if (!activeQuiz) return;
        try {
            const res = await axios.post(`/quizzes/${activeQuiz._id}/submit`, {
                answers: studentAnswers
            });
            alert(`Quiz Submitted! You scored: ${res.data.score}%`);
            setActiveQuiz(null);
            fetchQuizzes();
        } catch (err) {
            alert('Error submitting quiz: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Main Renderer
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                    <BrainCircuit className="text-purple-600" size={32} />
                    <span>Online Quiz System</span>
                </h1>
                {isTeacher && (
                    <button
                        onClick={() => setShowCreator(!showCreator)}
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 font-bold hover:bg-purple-700 transition"
                    >
                        {showCreator ? 'Cancel' : <><PlusCircle size={20} /> <span>Create MCQ Quiz</span></>}
                    </button>
                )}
            </div>

            {/* If Student is actively taking a quiz */}
            <AnimatePresence mode="wait">
                {activeQuiz && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 bg-gray-50 flex flex-col pt-16"
                    >
                        <div className="bg-white shadow-md w-full fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-8 z-50">
                            <h2 className="text-xl font-bold text-gray-800">{activeQuiz.title}</h2>
                            <div className={`flex items-center space-x-2 font-bold px-4 py-1.5 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
                                <Clock size={20} />
                                <span className="text-lg">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-8 mb-24">
                            <div className="max-w-3xl mx-auto space-y-8">
                                {activeQuiz.questions.map((q, idx) => (
                                    <div key={q._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">{idx + 1}. {q.questionText}</h3>
                                        <div className="space-y-3">
                                            {q.options.map((opt, oIdx) => (
                                                <label
                                                    key={oIdx}
                                                    onClick={() => setStudentAnswers({ ...studentAnswers, [q._id]: opt })}
                                                    className={`block border rounded-xl p-4 cursor-pointer transition-all ${studentAnswers[q._id] === opt ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${studentAnswers[q._id] === opt ? 'border-purple-500' : 'border-gray-400'}`}>
                                                            {studentAnswers[q._id] === opt && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                                        </div>
                                                        <span className="font-medium text-gray-700">{opt}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="max-w-3xl mx-auto flex justify-between items-center">
                                <span className="text-gray-500 font-medium">{Object.keys(studentAnswers).length} of {activeQuiz.questions.length} Answered</span>
                                <button onClick={submitQuiz} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-md shadow-purple-600/20">
                                    Submit Quiz Final
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {!activeQuiz && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject / Batch</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg text-gray-800 font-medium"
                    >
                        <option value="">-- Select a Batch --</option>
                        {batches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.subject}</option>)}
                    </select>
                </div>
            )}

            {/* Quiz Creator UI */}
            <AnimatePresence>
                {showCreator && isTeacher && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleCreateQuiz} className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 mb-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Quiz Title</label>
                                    <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-2.5 border rounded-lg" placeholder="e.g. Chapter 5 Physics Quiz" />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                                    <input type="number" required min="1" value={newDuration} onChange={e => setNewDuration(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Questions</h3>
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-white p-4 rounded-xl border border-gray-200">
                                        <div className="mb-3">
                                            <input
                                                required placeholder={`Question ${qIndex + 1} Text`}
                                                className="w-full p-2 border-b-2 font-medium bg-transparent focus:outline-none focus:border-purple-600"
                                                value={q.questionText}
                                                onChange={e => {
                                                    const newQ = [...questions];
                                                    newQ[qIndex].questionText = e.target.value;
                                                    setQuestions(newQ);
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            {q.options.map((opt, optIndex) => (
                                                <input
                                                    key={optIndex} required placeholder={`Option ${optIndex + 1}`}
                                                    className="w-full p-2 text-sm border rounded bg-gray-50"
                                                    value={opt}
                                                    onChange={e => {
                                                        const newQ = [...questions];
                                                        newQ[qIndex].options[optIndex] = e.target.value;
                                                        setQuestions(newQ);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <select
                                                required className="w-full p-2 text-sm border border-purple-300 rounded bg-purple-50 font-medium text-purple-800"
                                                value={q.correctAnswer}
                                                onChange={e => {
                                                    const newQ = [...questions];
                                                    newQ[qIndex].correctAnswer = e.target.value;
                                                    setQuestions(newQ);
                                                }}
                                            >
                                                <option value="">-- Choose Exact Correct Answer --</option>
                                                {q.options.map((opt, i) => opt && <option key={i} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddQuestion} className="text-purple-600 font-bold flex items-center space-x-2 text-sm">
                                    <PlusCircle size={16} /> <span>Add Another Question</span>
                                </button>
                            </div>

                            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition">
                                Publish Quiz Module
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quiz Roster List */}
            {!activeQuiz && selectedBatch && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500 py-8 bg-white rounded-xl border">No quizzes generated for this batch.</p>
                    ) : quizzes.map(quiz => {
                        let isFinished = false;
                        let myScore = null;

                        if (isStudent) {
                            const result = quiz.results?.find(r => r.studentId === user._id);
                            if (result) {
                                isFinished = true;
                                myScore = result.score;
                            }
                        }

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={quiz._id}
                                className={`rounded-xl p-6 shadow-sm border transition flex flex-col justify-between h-48 ${isFinished ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:shadow-md'}`}
                            >
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">{quiz.title}</h3>
                                    <div className="flex items-center space-x-3 text-sm font-medium text-gray-500 mb-4">
                                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {quiz.durationMinutes} mins</span>
                                        <span className="flex items-center"><AlertCircle size={14} className="mr-1" /> {quiz.questions.length} Qs</span>
                                    </div>
                                </div>

                                {isStudent ? (
                                    isFinished ? (
                                        <div className="flex items-center justify-between text-green-700 bg-green-100 p-2.5 rounded-lg border border-green-200 font-bold">
                                            <span className="flex items-center"><CheckCircle size={18} className="mr-2" /> Completed</span>
                                            <span>{myScore}% Score</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => startQuiz(quiz)} className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition flex justify-center items-center">
                                            Begin Quiz
                                        </button>
                                    )
                                ) : (
                                    <div className="text-sm font-semibold bg-gray-100 p-2 rounded text-center text-gray-600">
                                        {quiz.results?.length} Students Completed
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default Quizzes;
