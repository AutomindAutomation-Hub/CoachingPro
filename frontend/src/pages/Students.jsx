import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, Link as LinkIcon, Search, MoreVertical, Edit3, UserCheck, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const Students = () => {
    const { user } = useAuthStore();
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchParents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/students');
            setStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchParents = async () => {
        try {
            const { data } = await axios.get('/auth/parents');
            setParents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/students/${editingId}`, formData);
            } else {
                await axios.post('/students', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: '' });
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save student');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student completely?')) return;
        try {
            await axios.delete(`/students/${id}`);
            setIsModalOpen(false);
            setEditingId(null);
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete student');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Registry <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Insight</span></h1>
                    <p className="text-gray-400 font-medium">Manage student credentials and parent associations.</p>
                </div>
                {user?.role === 'Admin' && (
                    <motion.button
                        whileHover={{ scale: 1.05, shadow: "0 0 20px rgba(99,102,241,0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-accent text-white px-8 py-4 rounded-2xl flex items-center space-x-3 font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-accent/20"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Enlist Student</span>
                    </motion.button>
                )}
            </div>

            {/* Table Section */}
            <motion.div
                variants={itemVariants}
                className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="p-6">Identification</th>
                                <th className="p-6">Profile Details</th>
                                <th className="p-6">Authentication</th>
                                <th className="p-6">Guardian Link</th>
                                <th className="p-6 text-right">Operational</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Search size={48} className="mb-4 text-gray-500" />
                                            <p className="text-xl font-bold uppercase tracking-widest text-gray-500">No Entities Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, idx) => (
                                    <motion.tr
                                        key={student._id}
                                        variants={itemVariants}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                        className="transition-colors group"
                                    >
                                        <td className="p-6">
                                            <span className="font-black text-highlight bg-highlight/10 px-3 py-1.5 rounded-xl text-xs border border-highlight/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                                ID: {student.enrollmentNo || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-gray-300">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent/20 to-highlight/20 flex items-center justify-center text-accent font-black border border-white/10 group-hover:scale-110 transition-transform">
                                                    {student.userId?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{student.userId?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500 font-medium">Joined {new Date(student.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                                                <Shield size={14} className="text-accent" />
                                                <span className="truncate max-w-[150px]">{student.userId?.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {student.parentId ? (
                                                <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-xl border border-emerald-400/10 w-fit group/parent cursor-pointer">
                                                    <LinkIcon size={12} className="group-hover/parent:rotate-45 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{student.parentId.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center italic opacity-50">
                                                    <X size={12} className="mr-1" /> Orphan Node
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    setEditingId(student._id);
                                                    setFormData({
                                                        name: student.userId?.name || '',
                                                        email: student.userId?.email || '',
                                                        password: '',
                                                        phone: student.userId?.phone || '',
                                                        enrollmentNo: student.enrollmentNo || '',
                                                        parentId: student.parentId?._id || ''
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-3 text-accent hover:bg-accent/10 rounded-2xl transition-colors border border-transparent hover:border-accent/20"
                                            >
                                                <Edit3 size={18} strokeWidth={2.5} />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

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
                            className="glass-card rounded-[2.5rem] border border-white/10 p-10 w-full max-w-lg shadow-4xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-highlight" />

                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                                    <div className="p-2 bg-accent/20 rounded-xl mr-4">
                                        <UserCheck size={24} className="text-accent" />
                                    </div>
                                    {editingId ? 'Modify Credentials' : 'New Enrollment'}
                                </h2>
                                <button
                                    onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: '' }); }}
                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Identity</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Security Key</label>
                                        <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm" placeholder="••••••••" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Communication Port (Email)</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm" placeholder="john@example.com" />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mobile Interface</label>
                                        <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm" placeholder="+91..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Unique Serial (EnrollNo)</label>
                                        <input type="text" required value={formData.enrollmentNo} onChange={e => setFormData({ ...formData, enrollmentNo: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm" placeholder="EDU-12345" />
                                    </div>
                                </div>

                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                                    <label className="text-[10px] font-black text-highlight uppercase tracking-[0.2em] flex items-center">
                                        <LinkIcon size={14} className="mr-2" /> Guardian Connectivity
                                    </label>
                                    <select
                                        value={formData.parentId}
                                        onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                        className="w-full bg-surface border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all"
                                    >
                                        <option value="">-- No Linkage --</option>
                                        {parents.map(parent => (
                                            <option key={parent._id} value={parent._id} className="bg-surface">
                                                {parent.name} ({parent.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex space-x-3 pt-6">
                                    {editingId && user?.role === 'Admin' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => handleDelete(editingId)}
                                            className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                                            title="Terminate Record"
                                        >
                                            <Trash2 size={24} />
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02, shadow: "0 0 20px rgba(99,102,241,0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-accent to-highlight text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-accent/20"
                                    >
                                        Commit Changes
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

export default Students;
