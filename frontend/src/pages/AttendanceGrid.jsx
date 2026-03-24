import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, Calendar, Users, ClipboardCheck, Clock, UserCheck, UserX, UserMinus, Search, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const AttendanceGrid = () => {
    const { user } = useAuthStore();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]); // { studentId: status }
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch batches based on role
    useEffect(() => {
        const url = user?.role === 'Teacher' ? '/teachers/my-batches' : '/batches';
        axios.get(url).then(res => setBatches(res.data));
    }, [user?.role]);

    // When batch or date changes, fetch students AND existing attendance
    useEffect(() => {
        if (!selectedBatch) return;
        setLoading(true);
        setMessage(null);

        const loadRoster = async () => {
            try {
                // Fetch only students for this batch
                const stuRes = await axios.get(`/students/batch/${selectedBatch}`);
                const batchStudents = stuRes.data;
                console.log(`[Attendance] Loaded ${batchStudents.length} students for batch ${selectedBatch}`);
                setStudents(batchStudents);

                const attRes = await axios.get(`/attendance/${selectedBatch}/${date}`);

                const existingData = {};
                batchStudents.forEach(stu => {
                    const userId = stu.userId?._id || stu.userId; // Handle populated and unpopulated
                    if (!userId) return;
                    const record = attRes.data.find(r => (r.studentId?._id || r.studentId) === userId);
                    existingData[userId] = record ? record.status : 'Present';
                });
                setAttendanceData(existingData);

            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        loadRoster();
    }, [selectedBatch, date]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const submitBulkAttendance = async () => {
        if (!selectedBatch) return;
        setLoading(true);
        const payload = Object.keys(attendanceData).map(stId => ({
            studentId: stId,
            status: attendanceData[stId]
        }));

        try {
            await axios.post('/attendance/bulk', {
                batchId: selectedBatch,
                date,
                attendanceData: payload,
                notes: notes
            });
            setMessage({ type: 'success', text: 'Attendance updated and notifications triggered!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance.' });
        }
        setLoading(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 max-w-7xl mx-auto pb-20"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Attendance <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Central</span></h1>
                    <p className="text-gray-400 font-medium">Verify presence and broadcast status to stakeholders.</p>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <Calendar size={20} className="text-accent ml-2" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent border-none text-white font-bold text-sm focus:ring-0 cursor-pointer p-2"
                    />
                </div>
            </div>

            <motion.div
                variants={itemVariants}
                className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-6 items-end"
            >
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Protocol Node (Select Batch)</label>
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-accent appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-surface">-- Select Target Batch --</option>
                            {batches.map(b => <option key={b._id} value={b._id} className="bg-surface">{b.name} - {b.subject}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Operation Notes</label>
                    <div className="relative">
                        <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-highlight" size={20} />
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Shift details..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-highlight"
                        />
                    </div>
                </div>
                {selectedBatch && students.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={submitBulkAttendance}
                        disabled={loading}
                        className="bg-accent text-white px-8 py-4 rounded-2xl flex items-center space-x-3 font-black text-sm tracking-widest uppercase shadow-xl shadow-accent/20 disabled:opacity-50 h-[60px]"
                    >
                        {loading ? <Clock className="animate-spin" /> : <Save size={20} strokeWidth={3} />}
                        <span>{loading ? 'SYNCING...' : 'COMMIT STATUS'}</span>
                    </motion.button>
                )}
            </motion.div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-[2rem] flex items-center space-x-4 border shadow-2xl ${message.type === 'success' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-red-400/10 border-red-400/20 text-red-400'}`}
                    >
                        <AlertCircle size={24} />
                        <span className="font-bold tracking-tight">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedBatch && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-4xl"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="p-8">Student Identifier</th>
                                    <th className="p-8 text-right">Status Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="2" className="py-24 text-center opacity-40">
                                            <Clock size={48} className="mx-auto mb-4 text-accent animate-spin" />
                                            <p className="text-xl font-black uppercase tracking-[0.3em] text-accent">Initializing Node Synchronizer...</p>
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="py-24 text-center opacity-40">
                                            <Search size={48} className="mx-auto mb-4 text-gray-600 animate-pulse" />
                                            <p className="text-xl font-black uppercase tracking-[0.3em]">No Personnel Detected in Cluster</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map(student => {
                                        const resolvedUser = student.userId?._id ? student.userId : (typeof student.userId === 'object' ? student.userId : { _id: student.userId });
                                        const id = resolvedUser._id || student._id;
                                        if (!id) return null;
                                        const status = attendanceData[id] || 'Present';
                                        return (
                                            <motion.tr
                                                key={id}
                                                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                                className="transition-colors group"
                                            >
                                                <td className="p-8">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-highlight/20 flex items-center justify-center text-accent font-black border border-white/10">
                                                            {resolvedUser.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-lg tracking-tight group-hover:text-accent transition-colors">{resolvedUser.name || 'ANONYMOUS_ENTITY'}</p>
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">UID: {id.toString().slice(-8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <div className="inline-flex p-1.5 bg-white/5 rounded-[1.5rem] border border-white/10 gap-2">
                                                        <StatusButton
                                                            active={status === 'Present'}
                                                            onClick={() => handleStatusChange(id, 'Present')}
                                                            icon={<CheckCircle2 size={16} />}
                                                            label="Present"
                                                            color="emerald"
                                                        />
                                                        <StatusButton
                                                            active={status === 'Absent'}
                                                            onClick={() => handleStatusChange(id, 'Absent')}
                                                            icon={<XCircle size={16} />}
                                                            label="Absent"
                                                            color="red"
                                                        />
                                                        <StatusButton
                                                            active={status === 'Late'}
                                                            onClick={() => handleStatusChange(id, 'Late')}
                                                            icon={<Clock size={16} />}
                                                            label="Late"
                                                            color="amber"
                                                        />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

const StatusButton = ({ active, onClick, icon, label, color }) => {
    const variants = {
        emerald: active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40' : 'text-gray-500 bg-transparent border-transparent hover:bg-emerald-500/5 hover:text-emerald-400',
        red: active ? 'bg-red-500/20 text-red-400 border-red-400/40' : 'text-gray-500 bg-transparent border-transparent hover:bg-red-500/5 hover:text-red-400',
        amber: active ? 'bg-amber-500/20 text-amber-400 border-amber-400/40' : 'text-gray-500 bg-transparent border-transparent hover:bg-amber-500/5 hover:text-amber-400',
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${variants[color]}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

export default AttendanceGrid;
