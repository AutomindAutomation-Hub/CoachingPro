import { useAuthStore } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import { BookOpen, TrendingUp, BrainCircuit, IndianRupee, Sparkles, Fingerprint, ShieldCheck, Zap, Layers, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const { user } = useAuthStore();

    const qrPayload = JSON.stringify({ s: user?._id });

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
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden group bg-gradient-to-br from-accent to-indigo-900 rounded-[3rem] p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center border border-white/20"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <Sparkles size={160} />
                </div>
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/20 backdrop-blur-xl px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/80 w-fit mb-4 border border-white/20 shadow-inner"
                    >
                        Node Access Active
                    </motion.div>
                    <h1 className="text-5xl font-black mb-2 text-white flex items-center tracking-tighter">
                        Salutations, {user?.name.split(' ')[0]}!
                    </h1>
                    <p className="text-white/60 font-medium text-lg max-w-md">Your academic credentials and operations matrix are synchronized.</p>
                </div>
                <div className="mt-8 md:mt-0 relative z-10">
                    <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Live Biometric Stream</span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-5 glass-card rounded-[3rem] p-10 border border-white/10 relative flex flex-col items-center justify-center group overflow-hidden shadow-4xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-full flex justify-between items-center mb-10 relative z-10">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                            <Fingerprint size={28} className="text-accent mr-3" />
                            Digital Entitlement
                        </h2>
                        <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20">
                            <ShieldCheck size={20} className="text-accent" />
                        </div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(99,102,241,0.2)] border-2 border-accent relative z-10 group/qr"
                    >
                        <QRCodeSVG
                            value={qrPayload}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#0B0F19"}
                            level={"H"}
                        />
                        <div className="absolute inset-0 border-4 border-accent opacity-0 group-hover/qr:opacity-20 transition-opacity rounded-[2.5rem] pointer-events-none" />
                    </motion.div>

                    <div className="text-center mt-10 relative z-10 space-y-2">
                        <p className="text-2xl font-black text-white tracking-tight leading-none group-hover:text-accent transition-colors">{user?.name}</p>
                        <p className="text-gray-500 font-bold text-sm tracking-tight">{user?.email}</p>
                        <div className="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-xl mt-4">
                            <p className="text-[10px] font-black tracking-[0.3em] text-accent uppercase">Credentials: {user?._id.slice(-8)}</p>
                        </div>
                    </div>

                    <div className="mt-10 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-center relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                            Synchronize with Faculty Terminal to update attendance status.
                        </p>
                    </div>
                </motion.div>

                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { to: "/materials", color: "from-amber-500/20", icon: BookOpen, title: "Assets", desc: "Learning protocols and source PDFs.", accent: "text-amber-400", bg: "bg-amber-400" },
                        { to: "/progress", color: "from-indigo-500/20", icon: TrendingUp, title: "Operations", desc: "Trajectory tracking and performance data.", accent: "text-indigo-400", bg: "bg-indigo-400" },
                        { to: "/quizzes", color: "from-purple-500/20", icon: BrainCircuit, title: "Simulations", desc: "Interactive evaluation modules.", accent: "text-purple-400", bg: "bg-purple-400" },
                        { to: "/my-fees", color: "from-emerald-500/20", icon: IndianRupee, title: "Legers", desc: "Financial balance and credit management.", accent: "text-emerald-400", bg: "bg-emerald-400" }
                    ].map((action, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link to={action.to} className={`h-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col group hover:bg-white/10 transition-all shadow-xl hover:shadow-2xl overflow-hidden relative`}>
                                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${action.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className={`p-4 ${action.color} ${action.accent} rounded-2xl w-fit mb-6 border border-white/10 group-hover:scale-110 transition-transform shadow-inner`}>
                                    <action.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:translate-x-1 transition-transform uppercase">{action.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{action.desc}</p>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                                        <Zap size={18} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
