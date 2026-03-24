import { BookOpen, Users, FileText, QrCode, Zap, Layers, ChevronRight, Activity, Calendar, ShieldCheck, Target, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
    const { user } = useAuthStore();
    const [myBatches, setMyBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBatches = async () => {
            try {
                const { data } = await axios.get('/teachers/my-batches');
                setMyBatches(data);
            } catch (error) {
                console.error("Failed to fetch batches", error);
            }
            setLoading(false);
        };
        fetchMyBatches();
    }, []);

    const actions = [
        { title: 'Cluster Management', desc: 'Manage assigned student groups', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', link: '/batches' },
        { title: 'Status Logging', desc: 'Update attendance & mark records', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', link: '/attendance' },
        { title: 'Biometric Scan', desc: 'Secure ID card verification', icon: QrCode, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', link: '/scan-qr' },
        { title: 'Asset Repository', desc: 'Deploy notes & documentation', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', link: '/materials' },
    ];

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
                <Layers className="text-accent" size={40} />
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
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden group bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3rem] p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center border border-white/20"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck size={160} />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <div className="bg-white/20 backdrop-blur-xl px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/80 w-fit mb-4 border border-white/20 shadow-inner mx-auto md:mx-0">
                        Operational Authority Layer
                    </div>
                    <h1 className="text-5xl font-black mb-2 text-white tracking-tighter">
                        Mission <span className="text-highlight">Control</span>
                    </h1>
                    <p className="text-white/60 font-medium text-lg max-w-lg leading-relaxed">
                        Instructor Profile Active: <span className="text-white font-bold">{user?.name}</span>. Daily objectives are ready for deployment.
                    </p>
                </div>
                <div className="mt-8 md:mt-0 flex gap-4">
                    <div className="bg-black/20 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-inner text-center">
                        <Activity size={24} className="text-accent mx-auto mb-2" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="font-black text-white text-lg tracking-tight uppercase">Optimal</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {actions.map((action, i) => (
                    <motion.div key={i} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }}>
                        <Link to={action.link} className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center hover:shadow-3xl transition-all duration-500 cursor-pointer border border-white/5 group relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`p-6 rounded-[2rem] ${action.bg} ${action.color} ${action.border} border group-hover:scale-110 transition-transform mb-8 shadow-inner`}>
                                <action.icon size={36} />
                            </div>
                            <h3 className="text-xl font-black text-white text-center tracking-tight mb-2 uppercase">{action.title}</h3>
                            <p className="text-xs font-bold text-gray-500 text-center leading-relaxed tracking-tight group-hover:text-gray-400 transition-colors uppercase">{action.desc}</p>

                            <div className="mt-8 p-3 bg-white/5 rounded-full text-white/20 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={itemVariants} className="glass-card rounded-[3rem] p-10 border border-white/5 shadow-4xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-6 transition-transform">
                    <Target size={140} className="text-white" />
                </div>

                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center uppercase">
                        <LayoutGrid size={24} className="text-accent mr-4" />
                        Active Sector Clusters
                    </h2>
                    <div className="p-2 bg-accent/10 rounded-xl">
                        <Zap size={18} className="text-accent" />
                    </div>
                </div>

                {myBatches.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                        <Calendar size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest leading-none">No Active Deployments Found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myBatches.map(batch => (
                            <motion.div
                                key={batch._id}
                                whileHover={{ scale: 1.05 }}
                                className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-accent/20 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-accent/20 group-hover:bg-accent transition-colors" />
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2 group-hover:text-accent transition-colors">{batch.name}</h3>
                                <div className="bg-accent/10 border border-accent/20 px-3 py-1 rounded-xl text-[10px] font-black text-accent uppercase tracking-widest w-fit mb-4">
                                    {batch.subject}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-500 font-bold text-xs uppercase tracking-tight">
                                        <Calendar size={14} className="mr-2" />
                                        Timing Trace: {batch.timing}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default TeacherDashboard;
