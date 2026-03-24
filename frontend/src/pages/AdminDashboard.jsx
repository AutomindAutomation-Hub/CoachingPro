import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, IndianRupee, Layers, TrendingUp, Calendar, ArrowUpRight, ShieldCheck, Zap, Globe, Cpu, Database, Command, LayoutGrid, Search, Bell, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await axios.get('/analytics');
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="p-4 bg-accent/20 rounded-full border border-accent/20"
            >
                <Cpu className="text-accent" size={40} />
            </motion.div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 max-w-7xl mx-auto pb-20"
        >
            {/* Command Header */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden group bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[3rem] p-12 shadow-2xl border border-white/20"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                    <ShieldCheck size={200} />
                </div>
                <div className="absolute inset-0 bg-grid-white/[0.05] -z-10" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-accent w-fit border border-white/10 shadow-inner flex items-center">
                            <Zap size={12} className="mr-2" />
                            Administrative Core
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                            Executive <span className="text-highlight">Node</span>
                        </h1>
                        <p className="text-white/60 font-medium text-lg max-w-lg leading-relaxed">
                            Welcome back, <span className="text-white font-bold">{user?.name}</span>. Aggregate metrics are synced and operational.
                        </p>
                    </div>

                    <div className="mt-8 md:mt-0 flex gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-black/20 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-white/10 shadow-inner text-center min-w-[160px]"
                        >
                            <Calendar size={20} className="text-accent mx-auto mb-2" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cycle Range</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">
                                {stats?.currentMonth || 'MAR 2026'}
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/settings')}
                            className="bg-white/5 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 shadow-inner flex items-center justify-center aspect-square cursor-pointer"
                        >
                            <Settings size={28} className="text-white opacity-40 hover:opacity-100 transition-opacity" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* KPI Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Active Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-accent', bg: 'from-accent/20', sub: 'Total Cluster Mass' },
                    { label: 'Monthly Revenue', value: `₹${(stats?.feeStats && stats.feeStats[0]) ? stats.feeStats[0].collected : 0}`, icon: IndianRupee, color: 'text-highlight', bg: 'from-highlight/20', sub: 'Credit Yield' },
                    { label: 'System Presence', value: `${stats?.avgAttendance || 0}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-400/20', sub: 'Node Connectivity' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="glass-card rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden group shadow-3xl"
                    >
                        <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <stat.icon size={120} />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-5 rounded-3xl bg-gradient-to-br ${stat.bg} to-transparent border border-white/10 ${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
                                <stat.icon size={32} />
                            </div>
                            <div className="flex items-center text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-400/20 shadow-inner">
                                <ArrowUpRight size={14} className="mr-1.5" />
                                Optimal
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] uppercase mb-2">{stat.label}</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">{stat.value}</h3>
                            <p className="text-xs font-bold text-gray-400 opacity-60 tracking-tight leading-none uppercase">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Financial Trajectory */}
                <motion.div
                    variants={itemVariants}
                    className="glass-card rounded-[3.5rem] p-12 border border-white/5 flex flex-col shadow-4xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-highlight/20" />

                    <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center uppercase leading-none mb-1">
                                <TrendingUp className="text-accent mr-4" size={32} />
                                Revenue Flux
                            </h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Credit Projection Matrix</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="w-3 h-3 rounded-md bg-accent/20 border border-accent/30 mr-2" /> Target
                            </div>
                            <div className="flex items-center text-[10px] font-black text-highlight uppercase tracking-widest">
                                <div className="w-3 h-3 rounded-md bg-highlight mr-2 shadow-[0_0_12px_rgba(34,211,238,0.5)]" /> Realized
                            </div>
                        </div>
                    </div>

                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.feeStats || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(value) => `₹${value / 1000}K`}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(11, 15, 25, 0.95)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        padding: '20px',
                                        backdropBlur: '12px'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Bar dataKey="expected" name="Target" fill="rgba(99, 102, 241, 0.1)" stroke="rgba(99, 102, 241, 0.3)" radius={[10, 10, 10, 10]} barSize={32} />
                                <Bar dataKey="collected" name="Realized" fill="url(#colorCollected)" radius={[10, 10, 10, 10]} barSize={32} />
                                <defs>
                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* System Diagnostics */}
                <motion.div
                    variants={itemVariants}
                    className="relative rounded-[3.5rem] p-12 border border-white/5 bg-gradient-to-br from-indigo-500/10 to-surface overflow-hidden group shadow-4xl"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Cpu size={180} className="text-white" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-12 border-b border-white/5 pb-8">
                            <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-1 uppercase">Infrastructure</h2>
                            <p className="text-accent font-black text-[10px] uppercase tracking-[0.3em] leading-none">Quantum Runtime Diagnostic</p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-10">
                            {[
                                { name: 'Compute Engine', status: 'Synchronized', val: 98, icon: Cpu },
                                { name: 'Data Vault', status: 'Integrated', val: 100, icon: Database },
                                { name: 'Global Network', status: 'Optimal', val: 92, icon: Globe },
                            ].map((svc, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 mr-4 text-gray-400 group-hover:text-accent transition-colors">
                                                <svc.icon size={20} />
                                            </div>
                                            <span className="text-base font-black text-gray-200 tracking-tight uppercase leading-none">{svc.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-highlight uppercase tracking-[0.2em] leading-none">{svc.status}</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${svc.val}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + idx * 0.2, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-accent to-highlight shadow-[0_0_20px_rgba(34,211,238,0.4)] rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/terminal')}
                            className="mt-12 w-full py-6 glass bg-white/5 rounded-[2rem] group flex items-center justify-center space-x-3 transition-all duration-300 border border-white/10"
                        >
                            <Command size={20} className="text-accent" />
                            <span className="text-xs font-black text-white tracking-[0.3em] uppercase">Open Shell Console</span>
                            <ArrowUpRight size={18} className="text-highlight group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Quick Access Grid */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6"
            >
                {[
                    { icon: Users, label: 'Students', color: 'text-accent', bg: 'bg-accent/10', path: '/students' },
                    { icon: Users, label: 'Teachers', color: 'text-emerald-400', bg: 'bg-emerald-500/10', path: '/teachers' },
                    { icon: LayoutGrid, label: 'Batches', color: 'text-highlight', bg: 'bg-highlight/10', path: '/batches' },
                    { icon: FileText, label: 'Archives', color: 'text-indigo-400', bg: 'bg-indigo-500/10', path: '/materials' },
                    { icon: IndianRupee, label: 'Ledgers', color: 'text-amber-400', bg: 'bg-amber-500/10', path: '/fees' },
                    { icon: Bell, label: 'Attendance', color: 'text-rose-500', bg: 'bg-rose-500/10', path: '/attendance' },
                    { icon: Search, label: 'Scanner', color: 'text-cyan-400', bg: 'bg-cyan-500/10', path: '/scan-qr' },
                    { icon: Command, label: 'Controls', color: 'text-slate-400', bg: 'bg-slate-500/10', path: '/marks-entry' }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.08)", scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(item.path)}
                        className="glass-card p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-6 cursor-pointer group shadow-2xl transition-all duration-300"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.bg} ${item.color} group-hover:scale-110 transition-all duration-500 shadow-inner border border-white/5`}>
                            <item.icon size={32} />
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] group-hover:text-white transition-colors">{item.label}</span>
                            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-accent to-transparent transition-all duration-500 mt-2 mx-auto" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;
