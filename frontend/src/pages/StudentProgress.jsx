import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Award, Calendar, Target, Activity, Zap, ShieldCheck, Search, ChevronRight, Layers, Users } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const StudentProgress = () => {
    const { user } = useAuthStore();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Derived metrics
    const [averagePercent, setAveragePercent] = useState(0);
    const [highestScore, setHighestScore] = useState(0);

    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');

    // Fetch children if parent
    useEffect(() => {
        if (user?.role === 'Parent') {
            axios.get('/auth/parent/children').then(res => {
                setChildren(res.data);
                if (res.data.length > 0) {
                    setSelectedChildId(res.data[0].userId._id);
                }
            });
        } else if (user?.role === 'Student') {
            setSelectedChildId(user._id);
        }
    }, [user]);

    useEffect(() => {
        if (!selectedChildId) return;

        const fetchProgress = async () => {
            setLoading(true);
            try {
                const targetStudentId = selectedChildId.toString();

                const [testsRes, quizzesRes] = await Promise.all([
                    axios.get(`/tests/student/${targetStudentId}`),
                    axios.get(`/quizzes/student/${targetStudentId}`)
                ]);

                // Validate responses are arrays
                const testsArray = Array.isArray(testsRes.data) ? testsRes.data : [];
                const quizzesArray = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];

                // Format data for Recharts
                let totalPercent = 0;
                let validTests = 0;
                let highest = 0;
                let combinedData = [];

                testsArray.forEach(test => {
                    const myResult = test.results?.find(r => {
                        const rId = r.studentId?._id || r.studentId;
                        return rId && rId.toString() === targetStudentId;
                    });

                    const marks = myResult ? myResult.marksObtained : 0;
                    const percent = test.maxMarks > 0 ? (marks / test.maxMarks) * 100 : 0;

                    if (myResult && myResult.status !== 'Absent') {
                        totalPercent += percent;
                        validTests++;
                        if (percent > highest) highest = percent;
                    }

                    const dateObj = new Date(test.date);
                    const isValidDate = !isNaN(dateObj.getTime());

                    combinedData.push({
                        name: test.testName || 'Unnamed Test',
                        dateObj: isValidDate ? dateObj : new Date(),
                        score: Number(percent.toFixed(1)),
                        rawMarks: marks,
                        max: test.maxMarks || 0,
                        status: myResult?.status || 'Unknown'
                    });
                });

                quizzesArray.forEach(quiz => {
                    const myResult = quiz.results?.find(r => {
                        const rId = r.studentId?._id || r.studentId;
                        return rId && rId.toString() === targetStudentId;
                    });

                    if (myResult) {
                        const percent = myResult.score || 0;
                        totalPercent += percent;
                        validTests++;
                        if (percent > highest) highest = percent;

                        const dateObj = new Date(quiz.createdAt || Date.now());
                        const isValidDate = !isNaN(dateObj.getTime());

                        combinedData.push({
                            name: quiz.title || 'Unnamed Quiz',
                            dateObj: isValidDate ? dateObj : new Date(),
                            score: Number(percent.toFixed(1)),
                            rawMarks: Math.round((percent / 100) * (quiz.questions?.length || 0)),
                            max: quiz.questions?.length || 0,
                            status: 'Completed'
                        });
                    }
                });

                combinedData.sort((a, b) => a.dateObj - b.dateObj);

                const chartData = combinedData.map(item => ({
                    ...item,
                    date: format(item.dateObj, 'MMM dd'),
                    fullDate: format(item.dateObj, 'dd MMM yyyy')
                }));

                setTests(chartData);
                if (validTests > 0) setAveragePercent((totalPercent / validTests).toFixed(1));
                else setAveragePercent(0);
                setHighestScore(highest.toFixed(1));
            } catch (err) {
                console.error('Error fetching progress', err);
            }
            setLoading(false);
        };
        fetchProgress();
    }, [selectedChildId]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="p-4 bg-accent/20 rounded-full border border-accent/20"
            >
                <Target className="text-accent" size={40} />
            </motion.div>
        </div>
    );

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
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <TrendingUp className="text-indigo-400" size={32} />
                        </div>
                        <span>Growth <span className="gradient-text">Trajectory</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Analytical insights into academic performance clusters.</p>
                </div>
                {user?.role === 'Parent' && children.length > 1 && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center space-x-4 min-w-[240px]"
                    >
                        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/20">
                            <Users size={20} className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">Observed Entity</p>
                            <div className="relative">
                                <select
                                    className="bg-transparent text-white font-bold outline-none cursor-pointer w-full text-lg appearance-none pr-8"
                                    value={selectedChildId}
                                    onChange={(e) => setSelectedChildId(e.target.value)}
                                >
                                    {children.map(kid => (
                                        <option key={kid._id} value={kid.userId._id} className="bg-surface text-white">
                                            {kid.userId.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none rotate-90" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {tests.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    className="glass-card p-24 rounded-[3.5rem] border border-white/5 text-center shadow-4xl opacity-40"
                >
                    <Award size={80} className="mx-auto mb-6 text-gray-600" />
                    <h2 className="text-2xl font-black uppercase tracking-[0.3em]">No Simulation Data</h2>
                </motion.div>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: "Aggregate Score", value: `${averagePercent}%`, icon: Activity, color: "from-indigo-500 to-indigo-800", sub: "Standard Deviation Mode" },
                            { label: "Peak Performance", value: `${highestScore}%`, icon: Zap, color: "from-emerald-500 to-teal-800", sub: "Max Potential Reached" },
                            { label: "Active Nodes", value: tests.length, icon: Target, color: "from-blue-500 to-indigo-900", sub: "Total Assessments Logged" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`rounded-[2.5rem] p-10 text-white shadow-3xl relative overflow-hidden group border border-white/10`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} -z-10 opacity-90`} />
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <stat.icon size={100} />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{stat.label}</p>
                                    <h3 className="text-5xl font-black tracking-tighter leading-none">{stat.value}</h3>
                                    <div className="px-3 py-1 bg-white/10 rounded-xl w-fit border border-white/10 text-[10px] font-black uppercase tracking-widest">{stat.sub}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart Architecture */}
                    <motion.div
                        variants={itemVariants}
                        className="glass-card rounded-[3.5rem] shadow-4xl border border-white/5 p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent" />
                        <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none mb-1">Performance Flux</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Temporal assessment mapping</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Activity size={24} className="text-indigo-400" />
                            </div>
                        </div>

                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={tests} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(val) => `${val}%`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(11, 15, 25, 0.95)',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '20px',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                            backdropFilter: 'blur(12px)'
                                        }}
                                        labelStyle={{ color: '#6366F1', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}
                                        formatter={(value, name, props) => {
                                            if (props.payload.status === 'Absent') return ['ABORTED', 'Protocol Status'];
                                            return [`${value}% proficiency`, 'Result'];
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#6366F1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        dot={{ stroke: '#6366F1', strokeWidth: 3, r: 5, fill: '#0B0F19' }}
                                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2, fill: '#6366F1' }}
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Breakdown Matrix */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 px-2">
                            <Layers className="text-highlight" size={24} />
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Synoptic Log</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...tests].reverse().map((t, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
                                    className="glass-card group p-8 rounded-[2.5rem] border border-white/5 flex justify-between items-center transition-all shadow-xl"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-xl tracking-tight leading-none mb-1.5 group-hover:text-indigo-400 transition-colors uppercase">{t.name}</h4>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.fullDate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {t.status === 'Absent' ? (
                                            <span className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl border border-rose-500/20 font-black text-[10px] uppercase tracking-widest shadow-inner">Aborted</span>
                                        ) : (
                                            <div className="space-y-1">
                                                <h4 className="text-3xl font-black text-white tracking-tighter leading-none group-hover:text-highlight transition-colors mb-1">{t.score}%</h4>
                                                <div className="flex justify-end items-center space-x-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                    <ShieldCheck size={10} className="text-emerald-400" />
                                                    <span>{t.rawMarks} / {t.max} MAG</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default StudentProgress;

