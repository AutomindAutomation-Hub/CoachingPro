import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Users, FileText, IndianRupee, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuthStore();
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

    if (loading) return <div className="p-8">Loading Analytics...</div>;

    // Derived animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            className="space-y-8 max-w-7xl mx-auto pb-12"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-200">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-400 font-medium">Welcome back, {user?.name}. Here's what's happening today.</p>
                </div>
                <div className="mt-4 md:mt-0 bg-gray-800 px-5 py-2 rounded-xl border border-gray-700 font-semibold tracking-wide">
                    {stats?.currentMonth || 'Current Month'}
                </div>
            </div>

            {/* KPI Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition">
                    <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">Active Students</p>
                        <p className="text-4xl font-extrabold text-gray-800">{stats?.totalStudents || 0}</p>
                    </div>
                </motion.div>

                <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition">
                    <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                        <IndianRupee size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">Revenue ({(stats?.feeStats && stats.feeStats[0]) ? stats.feeStats[0]._id : 'Month'})</p>
                        <p className="text-4xl font-extrabold text-gray-800">₹{(stats?.feeStats && stats.feeStats[0]) ? stats.feeStats[0].collected : 0}</p>
                    </div>
                </motion.div>

                <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition">
                    <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
                        <FileText size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">Global Attendance</p>
                        <p className="text-4xl font-extrabold text-gray-800">{stats?.avgAttendance || 0}%</p>
                    </div>
                </motion.div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                        <BarChart className="text-gray-400" size={24} /> <span>Financial Trajectory</span>
                    </h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.feeStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <RechartsTooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="expected" name="Expected" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-md text-white">
                    <h2 className="text-xl font-bold mb-2">Platform Activity</h2>
                    <p className="text-indigo-100 mb-8 text-sm">A holistic view of batches and class assignments underway.</p>

                    {/* Decorative abstract elements vs real chart depending on scope for Phase 4 */}
                    <div className="h-64 flex flex-col justify-center items-center opacity-80 border-2 border-dashed border-white/20 rounded-2xl">
                        <Layers size={48} className="mb-4 text-white" />
                        <p className="font-bold tracking-widest uppercase">Analytics Module Active</p>
                        <p className="text-sm mt-2 text-indigo-100 text-center px-8">System scaling optimal. Use sidebar to dive into specific Batches and Student logs.</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
