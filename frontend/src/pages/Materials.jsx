import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { FileUp, Download, Trash2, FileText, BookOpen, Layers, Search, UploadCloud, ShieldCheck, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Materials = () => {
    const { user } = useAuthStore();
    const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin';
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [materials, setMaterials] = useState([]);

    // Upload state
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        axios.get('/batches').then(res => {
            setBatches(res.data);
            if (res.data.length > 0) {
                setSelectedBatch(res.data[0]._id);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedBatch) return;
        fetchMaterials();
    }, [selectedBatch]);

    const fetchMaterials = async () => {
        try {
            const { data } = await axios.get(`/materials/${selectedBatch}`);
            setMaterials(data);
        } catch (error) {
            console.error('Fetch err', error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title || !selectedBatch) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', title);
        formData.append('batchId', selectedBatch);

        setUploading(true);
        try {
            await axios.post('/materials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTitle('');
            setFile(null);
            fetchMaterials();
        } catch (err) {
            console.error('Upload err', err);
            alert('Failed to upload file');
        }
        setUploading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            await axios.delete(`/materials/${id}`);
            fetchMaterials();
        } catch (err) {
            alert('Failed to delete');
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
                            <BookOpen className="text-accent" size={32} />
                        </div>
                        <span>Knowledge <span className="gradient-text">Repository</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Deploy and access high-level learning assets.</p>
                </div>

                <div className="w-full md:w-auto">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Source Node</label>
                    <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-white font-bold text-sm focus:outline-none focus:border-accent appearance-none cursor-pointer min-w-[240px]"
                        >
                            {batches.map(b => <option key={b._id} value={b._id} className="bg-surface">{b.name} - {b.subject}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {isTeacher && (
                <motion.div
                    variants={itemVariants}
                    className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-4xl group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UploadCloud size={120} className="text-accent" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-8 flex items-center tracking-tight">
                        <div className="p-2 bg-accent/20 rounded-xl mr-4">
                            <FileUp className="text-accent" size={24} />
                        </div>
                        Push New Protocol
                    </h2>

                    <form onSubmit={handleUpload} className="flex flex-col lg:flex-row gap-6 items-end relative z-10">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Designation</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-accent transition-all"
                                placeholder="e.g. Chapter 4 - Thermodynamics Notes"
                                required
                            />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Binary Stream (PDF, Image)</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-[11px] px-6 text-gray-400 font-bold focus:outline-none focus:border-accent file:bg-accent file:text-white file:border-0 file:rounded-xl file:px-4 file:py-1 file:mr-4 file:text-xs file:font-black file:uppercase file:cursor-pointer hover:file:bg-highlight transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, shadow: "0 0 20px rgba(99,102,241,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={uploading}
                            className="w-full lg:w-auto bg-accent text-white px-12 py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl shadow-accent/20 disabled:opacity-50 h-[60px]"
                        >
                            {uploading ? 'UPLOADING...' : 'INITIALIZE UPLOAD'}
                        </motion.button>
                    </form>
                </motion.div>
            )}

            <div className="space-y-8">
                <div className="flex items-center space-x-4">
                    <div className="h-0.5 w-12 bg-accent/30 rounded-full" />
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] opacity-80">Available Modules</h2>
                </div>

                {materials.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="py-32 glass-card rounded-[3rem] text-center border border-white/5"
                    >
                        <div className="flex flex-col items-center opacity-20">
                            <Search size={64} className="mb-6 text-gray-600" />
                            <p className="text-2xl font-black uppercase tracking-[0.3em]">Module Cluster Empty</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {materials.map(mat => (
                            <motion.div
                                key={mat._id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className="glass-card rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between group shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isTeacher && (
                                        <button
                                            onClick={() => handleDelete(mat._id)}
                                            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <div className="mb-6 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 rounded-2xl border border-white/10 w-fit">
                                        <FileText size={32} className="text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-black text-xl text-white mb-2 line-clamp-2 tracking-tight">{mat.title}</h3>
                                    <div className="flex items-center space-x-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8">
                                        <ShieldCheck size={12} className="text-emerald-500" />
                                        <span>Origin: {mat.uploadedBy?.name || 'ROOT'}</span>
                                    </div>
                                </div>
                                <motion.a
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)" }}
                                    whileTap={{ scale: 0.98 }}
                                    href={`http://localhost:5000${mat.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center space-x-3 w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all"
                                >
                                    <Download size={16} className="text-accent" />
                                    <span>Download Asset</span>
                                </motion.a>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Materials;
