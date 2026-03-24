import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { BrainCircuit, Clock, CheckCircle, PlusCircle, AlertCircle, Sparkles, Layers, Trophy, ArrowRight, Zap, Target, UserCheck } from 'lucide-react';
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Main Renderer
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center space-x-4">
                        <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <BrainCircuit className="text-accent" size={32} />
                        </div>
                        <span>Neural <span className="gradient-text">Assessments</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Evaluate cognitive progress through automated MCQ protocols.</p>
                </div>
                {isTeacher && (
                    <motion.button
                        whileHover={{ scale: 1.05, shadow: "0 0 25px rgba(34,211,238,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreator(!showCreator)}
                        className="bg-highlight text-black px-8 py-4 rounded-2xl flex items-center space-x-3 font-black text-sm tracking-widest uppercase transition-all"
                    >
                        {showCreator ? "CANCEL ARCHITECT" : <><PlusCircle size={20} className="stroke-[3]" /> <span>DEPLOY QUIZ</span></>}
                    </motion.button>
                )}
            </div>

            {/* If Student is actively taking a quiz */}
            <AnimatePresence mode="wait">
                {activeQuiz && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background flex flex-col pt-20"
                    >
                        {/* Quiz Background Decorations */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-highlight/5 rounded-full blur-[100px] -z-10" />

                        <div className="glass border-b border-white/10 w-full fixed top-0 left-0 right-0 h-20 flex justify-between items-center px-10 z-[110]">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                    <Target className="text-highlight" size={24} />
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight">{activeQuiz.title}</h2>
                            </div>
                            <div className={`flex items-center space-x-3 font-black px-6 py-2.5 rounded-2xl border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-highlight/10 border-highlight/20 text-highlight'}`}>
                                <Clock size={20} strokeWidth={3} />
                                <span className="text-xl tracking-tighter">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-12 mb-28 custom-scrollbar">
                            <div className="max-w-4xl mx-auto space-y-10">
                                {activeQuiz.questions.map((q, idx) => (
                                    <motion.div
                                        key={q._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass-card p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 w-2 h-full bg-accent/20 group-hover:bg-accent/50 transition-colors" />
                                        <div className="flex items-start space-x-6">
                                            <span className="text-4xl font-black text-white/10 tracking-tighter select-none">{idx < 9 ? `0${idx + 1}` : idx + 1}</span>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-8 tracking-tight leading-relaxed">{q.questionText}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt, oIdx) => (
                                                        <motion.button
                                                            key={oIdx}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setStudentAnswers({ ...studentAnswers, [q._id]: opt })}
                                                            className={`text-left p-5 rounded-2xl border-2 transition-all flex items-center space-x-4 group/opt ${studentAnswers[q._id] === opt ? 'border-highlight bg-highlight/10 text-highlight shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20 text-gray-400'}`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${studentAnswers[q._id] === opt ? 'border-highlight bg-highlight text-black' : 'border-white/10'}`}>
                                                                {studentAnswers[q._id] === opt && <CheckCircle size={14} strokeWidth={4} />}
                                                            </div>
                                                            <span className="font-bold text-sm">{opt}</span>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-8 glass border-t border-white/10 shadow-3xl z-[110]">
                            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="h-2 w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(Object.keys(studentAnswers).length / activeQuiz.questions.length) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-accent to-highlight"
                                        />
                                    </div>
                                    <span className="text-sm font-black text-gray-500 uppercase tracking-widest">
                                        {Object.keys(studentAnswers).length} / {activeQuiz.questions.length} <span className="text-white">Processed</span>
                                    </span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05, shadow: "0 0 30px rgba(99,102,241,0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={submitQuiz}
                                    className="bg-accent text-white px-12 py-4 rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-xl shadow-accent/20 flex items-center space-x-3"
                                >
                                    <span>FINALIZE SUBMISSION</span>
                                    <ArrowRight size={20} strokeWidth={3} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {!activeQuiz && (
                <motion.div
                    variants={itemVariants}
                    className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
                >
                    <div className="flex items-center space-x-4 mb-6">
                        <Layers size={20} className="text-accent" />
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Batch selection</label>
                    </div>
                    <div className="relative group max-w-md">
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full bg-surface border-2 border-white/10 rounded-2xl p-4 text-white font-black text-lg focus:outline-none focus:border-accent group-hover:border-white/20 transition-all appearance-none cursor-pointer pr-12"
                        >
                            <option value="" className="bg-surface italic text-gray-500">-- Initialize Selection --</option>
                            {batches.map(b => <option key={b._id} value={b._id} className="bg-surface">{b.name} - {b.subject}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent">
                            <Zap size={24} />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Quiz Creator UI */}
            <AnimatePresence>
                {showCreator && isTeacher && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        <form onSubmit={handleCreateQuiz} className="glass-card border border-white/10 rounded-[2.5rem] p-12 space-y-10 shadow-4xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <PlusCircle size={200} className="text-white" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Module Title</label>
                                    <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold placeholder-gray-600 focus:outline-none focus:border-highlight transition-all" placeholder="e.g. Advanced Thermodynamics" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Protocol Duration (Minutes)</label>
                                    <div className="relative">
                                        <input type="number" required min="1" value={newDuration} onChange={e => setNewDuration(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" />
                                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <h3 className="font-black text-white text-xl tracking-tight uppercase">Questionnaire Matrix</h3>
                                    <span className="text-xs font-black text-accent bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">{questions.length} Items</span>
                                </div>
                                {questions.map((q, qIndex) => (
                                    <motion.div
                                        key={qIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 space-y-6 group"
                                    >
                                        <div className="relative">
                                            <input
                                                required placeholder={`Specify Question ${qIndex + 1} Parameters...`}
                                                className="w-full bg-transparent border-b-2 border-white/10 py-3 text-lg font-bold text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all"
                                                value={q.questionText}
                                                onChange={e => {
                                                    const newQ = [...questions];
                                                    newQ[qIndex].questionText = e.target.value;
                                                    setQuestions(newQ);
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, optIndex) => (
                                                <input
                                                    key={optIndex} required placeholder={`Option Value 0${optIndex + 1}`}
                                                    className="w-full bg-white/5 p-4 text-sm border border-white/5 rounded-2xl text-gray-300 focus:outline-none focus:border-white/20 transition-all font-medium"
                                                    value={opt}
                                                    onChange={e => {
                                                        const newQ = [...questions];
                                                        newQ[qIndex].options[optIndex] = e.target.value;
                                                        setQuestions(newQ);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <select
                                                required className="w-full bg-accent/5 p-4 text-sm border border-accent/20 rounded-2xl text-accent font-black focus:outline-none transition-all appearance-none cursor-pointer"
                                                value={q.correctAnswer}
                                                onChange={e => {
                                                    const newQ = [...questions];
                                                    newQ[qIndex].correctAnswer = e.target.value;
                                                    setQuestions(newQ);
                                                }}
                                            >
                                                <option value="" className="bg-surface">-- Select Definitive Answer --</option>
                                                {q.options.map((opt, i) => opt && <option key={i} value={opt} className="bg-surface">{opt}</option>)}
                                            </select>
                                            <Sparkles size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-accent pointer-events-none" />
                                        </div>
                                    </motion.div>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="w-full border-2 border-dashed border-white/10 p-6 rounded-3xl text-gray-500 font-black flex items-center justify-center space-x-3 hover:border-accent/30 hover:text-accent transition-all uppercase text-sm tracking-widest"
                                >
                                    <PlusCircle size={20} strokeWidth={3} />
                                    <span>Append Logical Block</span>
                                </motion.button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(34,211,238,0.2)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-accent to-highlight text-black font-black py-5 rounded-[1.5rem] tracking-[0.3em] uppercase transition-all shadow-2xl"
                            >
                                PUBLISH ASSESSMENT
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quiz Roster List */}
            {!activeQuiz && selectedBatch && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quizzes.length === 0 ? (
                        <div className="col-span-full glass-card p-20 flex flex-col items-center border border-white/5 opacity-40">
                            <Zap size={64} className="text-gray-600 mb-6" />
                            <p className="text-2xl font-black uppercase tracking-[0.3em] text-center">No Data In Transit</p>
                        </div>
                    ) : quizzes.map((quiz, idx) => {
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
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={quiz._id}
                                className={`glass-card rounded-[2.5rem] p-8 border transition-all flex flex-col relative group h-[320px] shadow-xl ${isFinished ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 hover:border-accent/30'}`}
                            >
                                <div className="absolute top-0 right-0 p-6">
                                    <div className={`p-2 rounded-xl border ${isFinished ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                        <Trophy size={20} />
                                    </div>
                                </div>

                                <div className="flex-1 mt-6">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-highlight shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                        <span className="text-[10px] font-black text-highlight tracking-[0.2em] uppercase">Status: Available</span>
                                    </div>
                                    <h3 className="font-black text-white text-2xl mb-4 tracking-tighter line-clamp-2 leading-tight group-hover:text-highlight transition-colors">{quiz.title}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                            <Clock size={12} className="text-accent" /> <span>{quiz.durationMinutes}M</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                            <AlertCircle size={12} className="text-highlight" /> <span>{quiz.questions.length} Items</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    {isStudent ? (
                                        isFinished ? (
                                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle size={18} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Mastered</span>
                                                </div>
                                                <span className="text-2xl font-black text-white tracking-tighter">{myScore}%</span>
                                            </div>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => startQuiz(quiz)}
                                                className="w-full bg-gradient-to-r from-accent to-highlight text-black py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-lg flex items-center justify-center space-x-3"
                                            >
                                                <span>INITIALIZE</span>
                                                <ArrowRight size={18} strokeWidth={3} />
                                            </motion.button>
                                        )
                                    ) : (
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enagement Level</span>
                                            <div className="flex items-center space-x-2 text-white font-black">
                                                <UserCheck size={16} className="text-accent" />
                                                <span className="text-xl tracking-tighter">{quiz.results?.length}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default Quizzes;
