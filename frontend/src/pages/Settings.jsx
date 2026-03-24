import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell, Layout, Cpu, Database, Save, CheckCircle, Globe, Palette, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        brandingName: '',
        academicCycle: '',
        supportPhone: '',
        timezone: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('/settings');
                setFormData({
                    brandingName: data.brandingName || 'CoachingPro Elite',
                    academicCycle: data.academicCycle || 'March 2026',
                    supportPhone: data.supportPhone || '+91 91234 56780',
                    timezone: data.timezone || 'Asia/Kolkata (GMT +5:30)'
                });
            } catch (err) {
                console.error('Fetch Fault:', err);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Sending Sync Request:', formData);
            const { data } = await axios.post('/settings', formData);
            console.log('Sync Response:', data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Sync Fault:', err);
            setError(err.response?.data?.message || 'Failed to synchronize protocols.');
        }
        setLoading(false);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (loading && !formData.brandingName) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="p-4 bg-accent/20 rounded-full border border-accent/20"
            >
                <SettingsIcon className="text-accent" size={40} />
            </motion.div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto space-y-10 pb-20"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center space-x-4">
                        <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-accent">
                            <SettingsIcon size={32} />
                        </div>
                        <span>Control <span className="gradient-text">Center</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Manage infrastructure protocols and system-wide overrides.</p>
                </div>

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-2xl flex items-center shadow-xl"
                        >
                            <CheckCircle size={20} className="mr-3" />
                            <span className="font-black text-xs uppercase tracking-widest">Protocols Synchronized</span>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-rose-500/10 border border-rose-500/30 text-rose-500 px-6 py-3 rounded-2xl flex items-center shadow-xl"
                        >
                            <AlertCircle size={20} className="mr-3" />
                            <span className="font-black text-xs uppercase tracking-widest">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid lg:grid-cols-[300px_1fr] gap-10">
                {/* Navigation */}
                <motion.div variants={itemVariants} className="space-y-4">
                    {[
                        { id: 'system', label: 'System Logic', icon: Cpu, sub: 'Core configurations' },
                        { id: 'appearance', label: 'Visual Interface', icon: Palette, sub: 'Theming & Branding' },
                        { id: 'notifications', label: 'Signal Broadcast', icon: Bell, sub: 'Alert protocols' },
                        { id: 'security', label: 'Armor Shield', icon: Shield, sub: 'Access & Entropy' },
                        { id: 'database', label: 'Data Vault', icon: Database, sub: 'Backups & Sharding' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${activeTab === tab.id ? 'bg-accent/10 border-accent text-white shadow-2xl shadow-accent/10' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div layoutId="settingTab" className="absolute left-0 top-0 w-1.5 h-full bg-accent" />
                            )}
                            <div className="flex items-center space-x-4">
                                <tab.icon size={24} className={activeTab === tab.id ? 'text-accent' : 'group-hover:text-white transition-colors'} />
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">{tab.label}</p>
                                    <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">{tab.sub}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </motion.div>

                {/* Content Area */}
                <motion.div
                    variants={itemVariants}
                    className="glass-card rounded-[3.5rem] border border-white/5 p-12 shadow-4xl min-h-[600px] flex flex-col"
                >
                    <div className="flex-1 space-y-12">
                        {activeTab === 'system' && (
                            <div className="space-y-10">
                                <div className="border-b border-white/5 pb-8">
                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Operational Parameters</h3>
                                    <p className="text-sm text-gray-400">Configure the heartbeat of your educational network.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Institute Branding Name</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                                            <input
                                                type="text"
                                                value={formData.brandingName}
                                                onChange={(e) => setFormData({ ...formData, brandingName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Academic Cycle</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                                            <select
                                                value={formData.academicCycle}
                                                onChange={(e) => setFormData({ ...formData, academicCycle: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-accent appearance-none capitalize cursor-pointer"
                                            >
                                                <option className="bg-surface">January 2026</option>
                                                <option className="bg-surface">February 2026</option>
                                                <option className="bg-surface">March 2026</option>
                                                <option className="bg-surface">April 2026</option>
                                                <option className="bg-surface">May 2026</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Support Hotline</label>
                                        <input
                                            type="text"
                                            value={formData.supportPhone}
                                            onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Timezone Synchronization</label>
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-accent appearance-none cursor-pointer"
                                        >
                                            <option className="bg-surface">Asia/Kolkata (GMT +5:30)</option>
                                            <option className="bg-surface">UTC (GMT +0:00)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-10">
                                <div className="border-b border-white/5 pb-8">
                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Visual Protocols</h3>
                                    <p className="text-sm text-gray-400">Manage the aesthetic spectrum of your executive node.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-black uppercase text-sm mb-1">Obsidian Dark Mode</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">High contrast interface saturation</p>
                                        </div>
                                        <div className="w-14 h-8 bg-accent rounded-full relative p-1 cursor-pointer">
                                            <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-lg" />
                                        </div>
                                    </div>
                                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-black uppercase text-sm mb-1">Glassmorphism Effects</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Active blur-recursion on UI layers</p>
                                        </div>
                                        <div className="w-14 h-8 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                                            <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'system' && activeTab !== 'appearance' && (
                            <div className="flex flex-col items-center justify-center h-96 text-center space-y-6 opacity-40">
                                <div className="p-8 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                                    <Layout size={60} className="text-gray-500" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Diagnostic Underway</h4>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">{activeTab} parameters are being recalculated.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-10 border-t border-white/5 flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.05, shadow: "0 0 30px rgba(99,102,241,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="bg-accent text-white px-12 py-5 rounded-[2rem] flex items-center space-x-4 font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl"
                        >
                            <Save size={24} />
                            <span>Synchronize Changes</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Settings;
