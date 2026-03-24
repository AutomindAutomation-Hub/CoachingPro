import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Users, IndianRupee, Activity, CheckCircle, Clock, AlertTriangle, Calendar, Award, Printer, ShieldCheck, Zap, Layers, Search, Bell, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ParentDashboard = () => {
    const { user } = useAuthStore();
    const [childrenData, setChildrenData] = useState([]);
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParentData = async () => {
            setLoading(true);
            try {
                const { data: myKids } = await axios.get('/auth/parent/children');

                if (myKids.length === 0) {
                    setChildrenData([]);
                    setLoading(false);
                    return;
                }

                const kidsWithData = await Promise.all(myKids.map(async (kid) => {
                    const studentId = kid.userId._id;
                    const feePromise = axios.get(`/fees/student/${studentId}`);
                    const attendancePromise = axios.get(`/attendance/student/${studentId}`);
                    const testsPromise = axios.get(`/tests/student/${studentId}`);

                    const [feeRes, attendanceRes, testsRes] = await Promise.all([feePromise, attendancePromise, testsPromise]);

                    const totalClasses = attendanceRes.data.length;
                    const presentClasses = attendanceRes.data.filter(a => a.status === 'Present').length;
                    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

                    return {
                        student: kid,
                        fees: feeRes.data,
                        attendance: attendanceRes.data,
                        tests: testsRes.data,
                        attendanceStats: { totalClasses, presentClasses, percentage: attendancePercentage }
                    };
                }));

                setChildrenData(kidsWithData);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchParentData();
    }, [user._id]);

    const generateReceiptPDF = (studentName, batchName, record, amountJustPaid) => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text("CoachingPro Institute", 105, 20, { align: "center" });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("FEE RECEIPT", 105, 30, { align: "center" });

        doc.setFontSize(11);
        doc.text(`Receipt ID: ${record.receiptId || 'REC-INITIAL'}`, 20, 50);
        doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 20, 60);

        doc.text(`Student Name: ${studentName}`, 20, 80);
        doc.text(`Batch/Course: ${batchName}`, 20, 90);
        doc.text(`Fee Period: ${record.month}`, 20, 100);

        autoTable(doc, {
            startY: 115,
            head: [['Description', 'Amount (INR)']],
            body: [
                ['Total Course / Monthly Fee Due', `Rs. ${record.dueAmount}`],
                ['Amount Paid Now', `Rs. ${amountJustPaid}`],
                ['Total Paid Till Date', `Rs. ${record.paidAmount}`],
                ['Remaining Balance', `Rs. ${record.dueAmount - record.paidAmount}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.setFontSize(10);
        doc.text("Thank you for your timely payment.", 105, 200, { align: "center" });

        doc.save(`Receipt_${studentName}_${record.month}.pdf`);
    };

    const handleOnlinePayment = async (fee) => {
        if (fee.status === 'Paid') return;

        const amountToPay = fee.dueAmount - fee.paidAmount;
        const confirmMsg = `Proceed to secure payment gateway to pay ₹${amountToPay} for ${fee.month}?`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const { data } = await axios.post(`/fees/${fee._id}/pay-online`, { amountPaid: amountToPay });

            const paidFee = data.fee;
            const currentChild = childrenData[selectedChildIndex];
            generateReceiptPDF(currentChild.student.userId.name, fee.batchId?.name || 'Batch', paidFee, amountToPay);

            const feeRes = await axios.get(`/fees/student/${currentChild.student.userId._id}`);
            const updatedKids = [...childrenData];
            updatedKids[selectedChildIndex].fees = feeRes.data;
            setChildrenData(updatedKids);

        } catch (err) {
            alert(err.response?.data?.message || 'Payment Failed');
        }
        setLoading(false);
    };

    const getStatusBadge = (status, dueDate) => {
        const isPastDue = new Date(dueDate) < new Date() && status !== 'Paid';

        if (status === 'Paid') return (
            <div className="bg-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest flex items-center bg-white/5 border border-emerald-500/30 w-fit">
                <CheckCircle size={12} className="mr-2" />
                <span>Cleared</span>
            </div>
        );
        if (isPastDue) return (
            <div className="bg-red-500/20 text-red-500 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest flex items-center bg-white/5 border border-red-500/30 w-fit">
                <AlertTriangle size={12} className="mr-2" />
                <span>Overdue</span>
            </div>
        );
        if (status === 'Partial') return (
            <div className="bg-amber-500/20 text-amber-500 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest flex items-center bg-white/5 border border-amber-500/30 w-fit">
                <Zap size={12} className="mr-2" />
                <span>Partial</span>
            </div>
        );
        return (
            <div className="bg-gray-500/20 text-gray-400 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest flex items-center bg-white/5 border border-white/10 w-fit">
                <Clock size={12} className="mr-2" />
                <span>Pending</span>
            </div>
        );
    };

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

    if (childrenData.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-24 rounded-[3.5rem] border border-white/5 text-center max-w-4xl mx-auto shadow-4xl my-20"
            >
                <div className="p-8 bg-white/5 rounded-full w-fit mx-auto border border-white/10 mb-10">
                    <Users size={80} className="text-gray-600 opacity-20" />
                </div>
                <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">No Linked Students</h2>
                <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-md mx-auto">Please contact the Administrator to link your child's profile to your Parent Account cluster.</p>
            </motion.div>
        );
    }

    const currentChildData = childrenData[selectedChildIndex];
    const { student, fees, attendance, tests, attendanceStats } = currentChildData;

    const latestTest = tests[tests.length - 1];
    const latestTestResult = latestTest?.results?.find(r => r.studentId === student.userId._id);
    const latestTestScoreMsg = latestTestResult ? `${latestTestResult.marksObtained} / ${latestTest.maxMarks}` : 'N/A';

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 max-w-7xl mx-auto pb-20"
        >
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden group bg-gradient-to-br from-emerald-600 to-teal-900 rounded-[3rem] p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center border border-white/20"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck size={160} />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <div className="bg-white/20 backdrop-blur-xl px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/80 w-fit mb-4 border border-white/20 shadow-inner mx-auto md:mx-0">
                        Parental Authority Layer
                    </div>
                    <h1 className="text-5xl font-black mb-2 text-white tracking-tighter">
                        Command Hub
                    </h1>
                    <p className="text-white/60 font-medium text-lg">Real-time sync with child's academic trajectory.</p>
                </div>

                {childrenData.length > 1 && (
                    <div className="mt-10 md:mt-0 relative z-10">
                        <div className="bg-black/20 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl flex items-center space-x-4 min-w-[240px]">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                                <Users size={20} className="text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 mb-1">Target Cluster</p>
                                <div className="relative">
                                    <select
                                        className="bg-transparent text-white font-bold outline-none cursor-pointer w-full text-lg appearance-none pr-8"
                                        value={selectedChildIndex}
                                        onChange={(e) => setSelectedChildIndex(Number(e.target.value))}
                                    >
                                        {childrenData.map((data, idx) => (
                                            <option key={data.student._id} value={idx} className="bg-teal-900 text-white">
                                                {data.student.userId.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Attendance Matrix", value: `${attendanceStats.percentage}%`, sub: `${attendanceStats.presentClasses} / ${attendanceStats.totalClasses} Units`, icon: Activity, color: attendanceStats.percentage >= 75 ? "text-emerald-400" : "text-rose-400", bg: "from-emerald-500/20" },
                    { label: "Latest Evaluation", value: latestTestScoreMsg, sub: latestTest ? latestTest.testName : "No Data", icon: Award, color: "text-blue-400", bg: "from-blue-500/20" },
                    { label: "Financial Status", value: fees.length > 0 ? `₹${fees[0].dueAmount - fees[0].paidAmount}` : "Cleared", sub: fees.length > 0 ? `Due: ${format(new Date(fees[0].dueDate), 'dd MMM')}` : "No Dues", icon: IndianRupee, color: "text-indigo-400", bg: "from-indigo-500/20" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -8 }}
                        className="glass-card p-10 rounded-[2.5rem] border border-white/10 flex items-center space-x-8 shadow-3xl relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <stat.icon size={100} />
                        </div>
                        <div className={`p-5 rounded-3xl bg-gradient-to-br ${stat.bg} to-transparent border border-white/10 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={36} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">{stat.value}</h3>
                            <p className="text-xs font-bold text-gray-400 opacity-60 tracking-tight">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                <motion.div
                    variants={itemVariants}
                    className="glass-card rounded-[3rem] p-10 border border-white/5 flex flex-col shadow-4xl h-full"
                >
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center uppercase">
                            <Calendar size={24} className="text-emerald-400 mr-4" />
                            Temporal Grid
                        </h2>
                        <div className="p-2 bg-emerald-400/10 rounded-xl">
                            <Zap size={18} className="text-emerald-400" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-4 space-y-4 custom-scrollbar">
                        {attendance.length === 0 ? (
                            <div className="py-20 text-center opacity-20">
                                <Search size={48} className="mx-auto mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No Logs Found</p>
                            </div>
                        ) : attendance.map(rec => (
                            <motion.div
                                key={rec._id}
                                whileHover={{ x: 4 }}
                                className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-400/20 transition-all group"
                            >
                                <div className="space-y-1">
                                    <p className="font-black text-white text-lg tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{format(new Date(rec.date), 'dd MMM yyyy')}</p>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{rec.batchId?.name || 'Unknown Cluster'}</p>
                                </div>
                                <div>
                                    <div className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] shadow-inner ${rec.status === 'Present' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                        rec.status === 'Late' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                            'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                        }`}>
                                        {rec.status}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="glass-card rounded-[3rem] p-10 border border-white/5 flex flex-col shadow-4xl h-full"
                >
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center uppercase">
                            <Award size={24} className="text-blue-400 mr-4" />
                            Simulation Metrics
                        </h2>
                        <div className="p-2 bg-blue-400/10 rounded-xl">
                            <Activity size={18} className="text-blue-400" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-4 space-y-6 custom-scrollbar">
                        {tests.length === 0 ? (
                            <div className="py-20 text-center opacity-20">
                                <Search size={48} className="mx-auto mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No Simulations Recorded</p>
                            </div>
                        ) : [...tests].reverse().map(test => {
                            const myResult = test.results.find(r => r.studentId === student.userId._id);
                            if (!myResult) return null;

                            const percentage = Math.round((myResult.marksObtained / test.maxMarks) * 100);

                            return (
                                <motion.div
                                    key={test._id}
                                    whileHover={{ x: 4 }}
                                    className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-400/20 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <p className="font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors uppercase leading-tight">{test.testName}</p>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{format(new Date(test.date), 'dd MMM yyyy')} | {test.batchId?.name || 'Core Node'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-baseline space-x-1">
                                                <span className="font-black text-blue-400 text-3xl tracking-tighter">{myResult.marksObtained}</span>
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">/ {test.maxMarks}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${percentage >= 80 ? 'bg-emerald-400' : percentage >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Execution Proficiency</span>
                                            <span className="text-xs font-black text-white tracking-widest">{percentage}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="glass-card rounded-[3.5rem] p-10 border border-white/5 lg:col-span-2 shadow-4xl"
                >
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center uppercase">
                            <IndianRupee size={24} className="text-indigo-400 mr-4" />
                            Credit Ledgers
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {fees.length === 0 ? (
                            <div className="col-span-2 py-10 text-center opacity-20">
                                <Search size={48} className="mx-auto mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No Credits Pending</p>
                            </div>
                        ) : fees.slice(0, 4).map(f => (
                            <motion.div
                                key={f._id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="flex justify-between items-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-indigo-400/20 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400/20 group-hover:bg-indigo-400 transition-colors" />
                                <div className="space-y-2">
                                    <p className="font-black text-white text-2xl tracking-tighter uppercase group-hover:text-indigo-400 transition-colors">{f.month}</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Exp: {format(new Date(f.dueDate), 'dd MMM yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="flex items-baseline space-x-1 mb-2">
                                        <span className="text-3xl font-black text-white tracking-tighter leading-none group-hover:text-highlight transition-colors flex items-center">
                                            <IndianRupee size={20} className="mr-0.5" />
                                            {f.dueAmount}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        {getStatusBadge(f.status, f.dueDate)}
                                    </div>
                                    {f.status !== 'Paid' ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05, shadow: "0 0 20px rgba(99,102,241,0.3)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleOnlinePayment(f)}
                                            className="text-[10px] font-black bg-accent text-white px-6 py-3 rounded-2xl uppercase tracking-widest shadow-xl"
                                        >
                                            Initialize Payment (₹{f.dueAmount - f.paidAmount})
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.1, color: "#22d3ee" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                const currentChild = childrenData.find(c => c.student.userId._id === f.studentId);
                                                generateReceiptPDF(currentChild?.student.userId.name || 'Student', f.batchId?.name || 'Batch', f, f.dueAmount);
                                            }}
                                            className="p-3 bg-white/5 border border-white/10 text-gray-500 rounded-2xl flex items-center space-x-2 group/rec"
                                            title="Download Certificate"
                                        >
                                            <Printer size={18} className="group-hover/rec:rotate-12 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">CERTIFICATE</span>
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-indigo-600/10 p-12 rounded-[4rem] border border-indigo-500/20 lg:col-span-2 shadow-inner relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
                        <Bell size={120} className="text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-black text-indigo-400 mb-8 uppercase tracking-tighter flex items-center">
                        <Bell size={28} className="mr-4" />
                        Network Directives
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            "Next Parent-Teacher Synchronization is scheduled for the terminal Saturday of this rotation.",
                            "Please acknowledge all pending credit ledgers prior to the upcoming evaluation cycle."
                        ].map((note, i) => (
                            <div key={i} className="flex items-start space-x-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                                <div className="p-2 bg-indigo-500/20 rounded-xl mt-1">
                                    <Zap size={14} className="text-indigo-400" />
                                </div>
                                <p className="text-gray-400 font-medium leading-relaxed">{note}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default ParentDashboard;
