import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'Student'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const { data } = await axios.post('/auth/register', formData);
            login(data, data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-highlight/10 rounded-full blur-[120px] -z-10 translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-4"
            >
                <div className="glass-card rounded-[2.5rem] border border-white/10 p-10 shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-highlight via-accent to-highlight" />

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center p-4 bg-highlight/10 border border-highlight/20 rounded-3xl text-highlight mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                        >
                            <Sparkles size={32} />
                        </motion.div>
                        <motion.h2
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-black tracking-tighter text-white"
                        >
                            Create <span className="gradient-text">Account</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 font-medium mt-1"
                        >
                            Start your journey with CoachingPro
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs font-bold"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                            <label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-2 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-highlight transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="pl-12 w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                <label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-2 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-highlight transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-12 w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all text-sm"
                                        placeholder="john@doe.com"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                <label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-2 ml-1">Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-highlight transition-colors" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-12 w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all text-sm"
                                        placeholder="12345..."
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                            <label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-2 ml-1">Identity</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-highlight transition-colors" size={18} />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="pl-12 w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all"
                                >
                                    <option value="Student" className="bg-surface">Student</option>
                                    <option value="Parent" className="bg-surface">Parent</option>
                                    <option value="Admin" className="bg-surface">Admin</option>
                                    <option value="Teacher" className="bg-surface">Teacher</option>
                                </select>
                            </div>
                        </motion.div>

                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                            <label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-2 ml-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-highlight transition-colors" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-12 w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-highlight to-accent py-4 rounded-2xl font-black text-white shadow-xl shadow-highlight/10 hover:shadow-highlight/30 transition-all duration-500 flex items-center justify-center space-x-2 group mt-4"
                        >
                            <span>INITIALIZE ACCOUNT</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center text-sm font-medium text-gray-500 mt-10"
                    >
                        Already registered?{' '}
                        <Link to="/login" className="text-accent font-black hover:text-white transition-colors">
                            Gate Access
                        </Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
