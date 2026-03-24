import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Users, BookOpen, Layers, Settings, LogOut, Home, FileText, QrCode, ClipboardList, IndianRupee, TrendingUp, BrainCircuit, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: Home, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
        { name: 'Enrollment', path: '/enrollment', icon: Layers, roles: ['Student'] },
        { name: 'Students', path: '/students', icon: Users, roles: ['Admin'] },
        { name: 'Teachers', path: '/teachers', icon: Users, roles: ['Admin'] },
        { name: 'Batches', path: '/batches', icon: Layers, roles: ['Admin', 'Teacher'] },
        { name: 'Attendance', path: '/attendance', icon: FileText, roles: ['Admin', 'Teacher'] },
        { name: 'QR Scan', path: '/scan-qr', icon: QrCode, roles: ['Admin', 'Teacher'] },
        { name: 'Materials', path: '/materials', icon: BookOpen, roles: ['Admin', 'Teacher', 'Student'] },
        { name: 'Online Quizzes', path: '/quizzes', icon: BrainCircuit, roles: ['Admin', 'Teacher', 'Student'] },
        { name: 'Tests & Marks', path: '/marks-entry', icon: ClipboardList, roles: ['Admin', 'Teacher'] },
        { name: 'My Progress', path: '/progress', icon: TrendingUp, roles: ['Student', 'Parent'] },
        { name: 'Fee Ledger', path: '/fees', icon: IndianRupee, roles: ['Admin'] },
    ];

    return (
        <aside className={`fixed md:sticky top-0 left-0 z-40 glass h-screen w-64 flex flex-col transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-white/5 shadow-2xl overflow-hidden`}>
            {/* Sidebar Glow */}
            <div className="absolute top-0 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-[80px] -z-10" />

            <div className="p-8 border-b border-white/5 flex justify-between items-center group">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-black tracking-tighter gradient-text"
                    >
                        CoachingPro
                    </motion.h2>
                    {user && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col mt-2"
                        >
                            <span className="text-xs font-bold text-highlight uppercase tracking-widest">{user.role}</span>
                            <span className="text-sm text-gray-400 truncate w-40">{user.name}</span>
                        </motion.div>
                    )}
                </div>
                {/* Mobile close button */}
                <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <ChevronRight size={24} className="rotate-180" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative">
                {navItems.filter(item => user && item.roles.includes(user.role)).map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`group flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                    ? 'bg-accent/10 text-white border border-accent/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 z-10">
                                    <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-highlight' : 'text-gray-400 group-hover:text-accent'}`} />
                                    <span className={`font-semibold text-sm tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                                    />
                                )}

                                <ChevronRight size={14} className={`opacity-0 -translate-x-2 transition-all duration-300 ${isActive ? 'opacity-50' : 'group-hover:opacity-50 group-hover:translate-x-0'}`} />
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5 glass mt-auto">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 group"
                >
                    <div className="p-2 rounded-xl group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Logout</span>
                </motion.button>
            </div>
        </aside>
    );
};

export default Sidebar;
