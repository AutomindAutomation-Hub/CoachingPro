import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ClipboardList, TrendingUp, Layers, Zap, Search, User, Target, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const MarksEntry = () => {
    const { user } = useAuthStore();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);

    // Test form details
    const [testName, setTestName] = useState('');
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [maxMarks, setMaxMarks] = useState(100);
    const [marksData, setMarksData] = useState({}); // { studentId: value }

    // Existing tests in batch
    const [existingTests, setExistingTests] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState('new'); // 'new' vs specific test id
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const url = user?.role === 'Teacher' ? '/teachers/my-batches' : '/batches';
        axios.get(url).then(res => setBatches(res.data));
    }, [user?.role]);

    // Load students and tests when batch changes
    useEffect(() => {
        if (!selectedBatch) return;
        setLoading(true);
        setMessage(null);

        const loadBatchData = async () => {
            try {
                // Fetch only students for this batch
                const stuRes = await axios.get(`/students/batch/${selectedBatch}`);
                const batchStudents = stuRes.data;
                setStudents(batchStudents);

                // Init blank marks mapping for 'new'
                const blankData = {};
                batchStudents.forEach(s => {
                    const userId = s.userId?._id || s.userId;
                    if (userId) blankData[userId] = '';
                });

                // Get existing tests
                const testRes = await axios.get(`/tests/${selectedBatch}`);
                setExistingTests(testRes.data);

                // If we are on 'new' test, initialize with blank data
                if (selectedTestId === 'new') {
                    setTestName('');
                    setMaxMarks(100);
                    setMarksData(blankData);
                }

            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'System Error: Failed to retrieve cluster personnel. Check connection logic.' });
            }
            setLoading(false);
        };
        loadBatchData();
    }, [selectedBatch]); // Removed selectedTestId to avoid redundant reload

    // Separate logic to switch marks mapping based on test selection
    useEffect(() => {
        if (!selectedBatch || students.length === 0) return;

        if (selectedTestId === 'new') {
            const blankData = {};
            students.forEach(s => {
                const userId = s.userId?._id || s.userId;
                if (userId) blankData[userId] = '';
            });
            setMarksData(blankData);
            setTestName('');
            setMaxMarks(100);
            return;
        }

        // Load specific test marks into state
        const test = existingTests.find(t => t._id === selectedTestId);
        if (test) {
            setTestName(test.testName);
            setTestDate(new Date(test.date).toISOString().split('T')[0]);
            setMaxMarks(test.maxMarks);
            const loadedMarks = {};

            // Initialize with empty for all students currently in state
            students.forEach(s => {
                const userId = s.userId?._id || s.userId;
                if (userId) loadedMarks[userId] = '';
            });

            test.results.forEach(res => {
                if (res.studentId) {
                    const id = res.studentId._id || res.studentId;
                    loadedMarks[id] = res.status === 'Absent' ? 'A' : res.marksObtained;
                }
            });
            setMarksData(loadedMarks);
        }
    }, [selectedTestId, existingTests, students]);

    const handleMarksChange = (studentId, val) => {
        setMarksData(prev => ({ ...prev, [studentId]: val }));
    };

    const submitMarks = async () => {
        if (!selectedBatch || !testName || !maxMarks) {
            setMessage({ type: 'error', text: 'Please fill name and max marks' });
            return;
        }

        setLoading(true);
        const resultsArray = Object.keys(marksData).map(stId => {
            const val = marksData[stId];
            return {
                studentId: stId,
                status: (val === 'A' || val === 'a') ? 'Absent' : 'Present',
                marksObtained: (val === 'A' || val === 'a' || val === '') ? 0 : Number(val)
            };
        });

        try {
            if (selectedTestId === 'new') {
                const res = await axios.post('/tests', {
                    batchId: selectedBatch,
                    testName,
                    date: testDate,
                    maxMarks,
                    results: resultsArray
                });
                setMessage({ type: 'success', text: 'New test marks saved successfully!' });

                // Refresh existing tests list
                const testRes = await axios.get(`/tests/${selectedBatch}`);
                setExistingTests(testRes.data);
                setSelectedTestId(res.data._id); // switch to edit mode of new test
            } else {
                await axios.put(`/tests/${selectedTestId}`, {
                    results: resultsArray
                });
                setMessage({ type: 'success', text: 'Test marks updated successfully!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save marks' });
        }
        setLoading(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 max-w-7xl mx-auto pb-20"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center space-x-4">
                        <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-accent">
                            <ClipboardList size={32} />
                        </div>
                        <span>Evaluation <span className="gradient-text">Matrix</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Log and synchronize student performance benchmarks.</p>
                </div>
            </div>

            <motion.div
                variants={itemVariants}
                className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-4xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-highlight to-accent animate-pulse" />

                <div className="grid md:grid-cols-2 gap-8 z-10 relative">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Cluster</label>
                        <div className="relative">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                            <select
                                value={selectedBatch}
                                onChange={(e) => { setSelectedBatch(e.target.value); setSelectedTestId('new'); }}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-surface italic text-gray-500">-- Select Operational Node --</option>
                                {batches.map(b => <option key={b._id} value={b._id} className="bg-surface">{b.name} - {b.subject}</option>)}
                            </select>
                        </div>
                    </div>

                    {selectedBatch && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Session Protocol</label>
                            <div className="relative text-accent">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
                                <select
                                    value={selectedTestId}
                                    onChange={(e) => setSelectedTestId(e.target.value)}
                                    className="w-full bg-accent/10 border border-accent/20 rounded-2xl py-4 pl-12 pr-6 text-accent font-black tracking-tight focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="new" className="bg-surface text-accent">+ INITIALIZE NEW RECORD</option>
                                    {existingTests.map(t => (
                                        <option key={t._id} value={t._id} className="bg-surface text-white italic">
                                            SYNced: {t.testName} ({new Date(t.date).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className={`p-6 rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-xl flex items-center space-x-4 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}
                    >
                        {message.type === 'success' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                        <span className="text-lg font-black tracking-tight">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedBatch && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="glass-card rounded-[3.5rem] border border-white/5 overflow-hidden shadow-4xl mb-12"
                >
                    <div className="p-10 border-b border-white/5 bg-white/5">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Title</label>
                                <input
                                    type="text" value={testName} onChange={(e) => setTestName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold placeholder-gray-600 focus:outline-none focus:border-highlight transition-all" placeholder="e.g. Mock Cycle A1" required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Temporal Stamp</label>
                                <input
                                    type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Peak Magnitude (Max)</label>
                                <input
                                    type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" required min="1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-2 md:p-10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="p-8">Node Identifier</th>
                                        <th className="p-8 text-center">Magnitude Logged</th>
                                        <th className="p-8 text-right">Proficiency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="py-24 text-center opacity-40">
                                                <Clock size={48} className="mx-auto mb-4 text-highlight animate-spin" />
                                                <p className="text-xl font-black uppercase tracking-[0.3em] text-highlight">Accessing Evaluation Logs...</p>
                                            </td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-20 text-center opacity-40">
                                                <Search size={48} className="mx-auto mb-4 text-gray-600 animate-pulse" />
                                                <p className="text-xl font-black uppercase tracking-[0.3em]">No Personnel Detected in Cluster</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student, i) => {
                                            const resolvedUser = student.userId?._id ? student.userId : (typeof student.userId === 'object' ? student.userId : { _id: student.userId });
                                            const id = resolvedUser._id || student._id;
                                            if (!id) return null;

                                            const val = marksData[id] || '';
                                            const numVal = Number(val);
                                            const percent = (!isNaN(numVal) && maxMarks > 0) ? ((numVal / maxMarks) * 100).toFixed(1) : '-';

                                            return (
                                                <motion.tr
                                                    key={id}
                                                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                                    className="transition-colors group"
                                                >
                                                    <td className="p-8">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-500 group-hover:text-accent transition-colors">
                                                                <User size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-white text-lg tracking-tight uppercase leading-none group-hover:text-accent transition-all">{resolvedUser.name || 'ANONYMOUS_ENTITY'}</p>
                                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">UID: {id.toString().slice(-8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8">
                                                        <input
                                                            type="text"
                                                            value={val}
                                                            onChange={(e) => handleMarksChange(id, e.target.value)}
                                                            className="w-32 mx-auto bg-white/5 border border-white/10 p-3 rounded-2xl text-center font-black text-highlight focus:outline-none focus:border-highlight transition-all shadow-inner tracking-widest uppercase placeholder-gray-700 block"
                                                            placeholder="MAG / 'A'"
                                                        />
                                                    </td>
                                                    <td className="p-8 text-right">
                                                        <div className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest inline-block shadow-inner ${val === 'A' || val === 'a' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                                                            {val === 'A' || val === 'a' ? 'ABORTED' : `${percent}%`}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>

                            {students.length > 0 && (
                                <div className="p-10 border-t border-white/5 flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05, shadow: "0 0 30px rgba(16,185,129,0.3)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={submitMarks}
                                        disabled={loading}
                                        className="bg-emerald-500 text-black px-12 py-5 rounded-[2rem] flex items-center space-x-4 font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl disabled:opacity-50"
                                    >
                                        <Save size={24} strokeWidth={3} />
                                        <span>{selectedTestId === 'new' ? 'DEPLOY DATA' : 'UPDATE SYNC'}</span>
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default MarksEntry;

