import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, Calendar, User, BookOpen, IndianRupee, LayoutGrid, Layers, Settings2, Trash } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const Batches = () => {
    const { user } = useAuthStore();
    const [batches, setBatches] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' });

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
    }, []);

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/batches');
            setBatches(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const { data } = await axios.get('/teachers');
            setTeachers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/batches/${editingId}`, formData);
            } else {
                await axios.post('/batches', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' });
            fetchBatches();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save batch');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this batch? All associated data might be affected.')) return;
        try {
            await axios.delete(`/batches/${id}`);
            setIsModalOpen(false);
            setEditingId(null);
            fetchBatches();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete batch');
        }
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
            className="space-y-10 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center space-x-4">
                        <div className="p-3 bg-highlight/20 rounded-2xl border border-highlight/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                            <Layers className="text-highlight" size={32} />
                        </div>
                        <span>Batch <span className="gradient-text">Architecture</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Design and manage synchronized learning protocols.</p>
                </div>
                {user?.role === 'Admin' && (
                    <motion.button
                        whileHover={{ scale: 1.05, shadow: "0 0 25px rgba(34,211,238,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-highlight text-black px-8 py-4 rounded-2xl flex items-center space-x-3 font-black text-sm tracking-widest uppercase transition-all"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>INITIALIZE BATCH</span>
                    </motion.button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {batches.length === 0 ? (
                    <div className="col-span-full py-20 glass-card rounded-[2.5rem] flex flex-col items-center opacity-40 border border-white/5">
                        <LayoutGrid size={64} className="text-gray-600 mb-6" />
                        <p className="text-2xl font-black uppercase tracking-[0.3em] text-center">No Active Clusters</p>
                    </div>
                ) : (
                    batches.map((batch) => (
                        <motion.div
                            key={batch._id}
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            className="glass-card rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10px] font-black tracking-widest text-accent uppercase bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">
                                    {batch.subject || 'GENERAL'}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white tracking-tighter mb-1 line-clamp-1">{batch.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400/70 tracking-widest uppercase">System Online</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center space-x-4 text-gray-400">
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        <User size={16} className="text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Instructor</p>
                                        <p className="text-sm font-bold text-gray-200">{batch.teacherId?.name || 'NODE_UNASSIGNED'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-gray-400">
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        <Calendar size={16} className="text-highlight" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Temporal Window</p>
                                        <p className="text-sm font-bold text-gray-200">{batch.timing}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-gray-400">
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        <IndianRupee size={16} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resource Value</p>
                                        <p className="text-sm font-bold text-gray-200">₹{batch.monthlyFee} <span className="opacity-40">/ MO</span></p>
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'Admin' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setEditingId(batch._id);
                                        setFormData({
                                            name: batch.name || '',
                                            teacherId: batch.teacherId?._id || '',
                                            timing: batch.timing || '',
                                            subject: batch.subject || '',
                                            monthlyFee: batch.monthlyFee || ''
                                        });
                                        setIsModalOpen(true);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 text-gray-400 py-3 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all flex items-center justify-center space-x-2"
                                >
                                    <Settings2 size={16} />
                                    <span>CONFIGURE BATCH</span>
                                </motion.button>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="glass-card rounded-[2.5rem] p-10 w-full max-w-lg border border-white/10 shadow-4xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-highlight" />

                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                                    <div className="p-2 bg-highlight/20 rounded-xl mr-4">
                                        <Layers size={24} className="text-highlight" />
                                    </div>
                                    {editingId ? 'Cluster Config' : 'New Cluster'}
                                </h2>
                                <button
                                    onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' }); }}
                                    className="p-2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Batch Designation</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" placeholder="e.g. Class 10 Physics" />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assigned Lead</label>
                                        <select required value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all appearance-none cursor-pointer">
                                            <option value="" className="bg-surface text-gray-500 italic">Select Lead...</option>
                                            {teachers.map(t => <option key={t._id} value={t._id} className="bg-surface">{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subject domain</label>
                                        <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" placeholder="Mathematics" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Temporal Window (Timing)</label>
                                    <div className="relative">
                                        <input type="text" required value={formData.timing} onChange={e => setFormData({ ...formData, timing: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" placeholder="MWF 4PM - 6PM" />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Value (Monthly Fee)</label>
                                    <div className="relative">
                                        <input type="number" required value={formData.monthlyFee} onChange={e => setFormData({ ...formData, monthlyFee: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-highlight transition-all" />
                                        <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    {editingId && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => handleDelete(editingId)}
                                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl font-black hover:bg-red-500/20 transition-all flex items-center justify-center aspect-square"
                                        >
                                            <Trash2 size={24} />
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02, shadow: "0 0 25px rgba(34,211,238,0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-accent to-highlight text-black font-black py-4 rounded-2xl tracking-[0.2em] uppercase transition-all shadow-xl"
                                    >
                                        {editingId ? 'DEPLOY CONFIG' : 'INITIALIZE MODULE'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Batches;
