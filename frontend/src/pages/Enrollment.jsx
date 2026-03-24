import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Layers, CheckCircle2, IndianRupee, Clock, User, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Enrollment = () => {
    const [batches, setBatches] = useState([]);
    const [enrolledBatchIds, setEnrolledBatchIds] = useState([]);
    const { user } = useAuthStore();
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchBatchesAndStudentData();
    }, []);

    const fetchBatchesAndStudentData = async () => {
        try {
            const { data: allBatches } = await axios.get('/batches');
            setBatches(allBatches);

            const { data: studentProfile } = await axios.get(`/students/me`);
            setEnrolledBatchIds(studentProfile.batchIds.map(b => b._id || b));

        } catch (error) {
            console.error(error);
        }
    };

    const handleEnroll = async (batchId) => {
        try {
            setMessage(null);
            await axios.post('/students/enroll', { batchId });
            setMessage({ type: 'success', text: 'Successfully enrolled!' });
            setEnrolledBatchIds([...enrolledBatchIds, batchId]);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enroll' });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            className="space-y-10 max-w-7xl mx-auto pb-20"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center space-x-4">
                        <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Sparkles className="text-accent" size={32} />
                        </div>
                        <span>Course <span className="gradient-text">Selection</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Initialize your learning modules and join active clusters.</p>
                </div>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-[2.5rem] flex items-center space-x-4 border shadow-2xl ${message.type === 'success' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-red-400/10 border-red-400/20 text-red-400'}`}
                    >
                        <ShieldAlert size={24} />
                        <span className="font-bold tracking-tight">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {batches.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="col-span-full py-32 glass-card rounded-[3rem] text-center border border-white/5"
                    >
                        <div className="flex flex-col items-center opacity-20">
                            <BookOpen size={64} className="mb-6 text-gray-600" />
                            <p className="text-2xl font-black uppercase tracking-[0.3em]">No Batches Active</p>
                        </div>
                    </motion.div>
                ) : (
                    batches.map((batch) => {
                        const isEnrolled = enrolledBatchIds.includes(batch._id);
                        return (
                            <motion.div
                                key={batch._id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className="glass-card rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between group shadow-2xl relative overflow-hidden h-full"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Layers size={100} className="text-highlight" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{batch.name}</h3>
                                            <div className="flex items-center space-x-2 text-[10px] font-black text-accent uppercase tracking-widest">
                                                <Sparkles size={10} />
                                                <span>{batch.subject}</span>
                                            </div>
                                        </div>
                                        {isEnrolled && (
                                            <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center space-x-3 text-gray-400 group/item">
                                            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover/item:border-accent/30 transition-colors">
                                                <User size={14} className="group-hover/item:text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Lead Educator</p>
                                                <p className="text-sm font-bold text-gray-300 group-hover/item:text-white transition-colors">{batch.teacherId?.name || 'Unallocated'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-gray-400 group/item">
                                            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover/item:border-accent/30 transition-colors">
                                                <Clock size={14} className="group-hover/item:text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Temporal Window</p>
                                                <p className="text-sm font-bold text-gray-300 group-hover/item:text-white transition-colors">{batch.timing}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-gray-400 group/item">
                                            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover/item:border-accent/30 transition-colors">
                                                <IndianRupee size={14} className="group-hover/item:text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Resource Credit</p>
                                                <p className="text-sm font-bold text-gray-300 group-hover/item:text-white transition-colors">₹{batch.monthlyFee} / Month</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={!isEnrolled ? { scale: 1.02, shadow: "0 0 20px rgba(99,102,241,0.3)" } : {}}
                                    whileTap={!isEnrolled ? { scale: 0.98 } : {}}
                                    onClick={() => handleEnroll(batch._id)}
                                    disabled={isEnrolled}
                                    className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-3 border ${isEnrolled
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500/50 cursor-not-allowed'
                                        : 'bg-accent border-accent text-white shadow-xl shadow-accent/20'
                                        }`}
                                >
                                    {isEnrolled ? (
                                        <>
                                            <CheckCircle2 size={16} />
                                            <span>Active Member</span>
                                        </>
                                    ) : (
                                        'Initialize Enrollment'
                                    )}
                                </motion.button>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default Enrollment;
