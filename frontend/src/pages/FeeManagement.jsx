import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndianRupee, Printer, AlertTriangle, CheckCircle, Clock, Calendar, Search, Filter, CreditCard, Receipt, TrendingUp, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const FeeManagement = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Generation State
    const [genMonth, setGenMonth] = useState('');
    const [genDueDate, setGenDueDate] = useState('');

    useEffect(() => {
        axios.get('/batches').then(res => setBatches(res.data));
    }, []);

    useEffect(() => {
        const fetchFees = async () => {
            setLoading(true);
            try {
                const url = selectedBatch ? `/fees?batchId=${selectedBatch}` : `/fees`;
                const { data } = await axios.get(url);
                setFees(data);

                // Fetch students count if batch is selected
                if (selectedBatch) {
                    const stuRes = await axios.get('/students');
                    const batchStudents = stuRes.data.filter(s => s.batchIds?.some(b => (b._id || b) === selectedBatch));
                    setStudents(batchStudents);
                } else {
                    setStudents([]);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchFees();
    }, [selectedBatch, refreshTrigger]);

    const handleGenerateFees = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/fees/generate', {
                batchId: selectedBatch,
                month: genMonth,
                dueDate: genDueDate
            });
            alert('Fees generated successfully!');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating fees');
        }
    };

    const handlePayFee = async (fee) => {
        const amountStr = prompt(`Enter payment amount for ${fee.studentId.name}:\n(Balance: ₹${fee.dueAmount - fee.paidAmount})`, (fee.dueAmount - fee.paidAmount).toString());
        if (!amountStr) return;

        const amountPaid = Number(amountStr);
        if (isNaN(amountPaid) || amountPaid <= 0) return alert('Invalid amount');

        try {
            const res = await axios.put(`/fees/${fee._id}/pay`, { amountPaid });
            generateReceiptPDF(fee.studentId.name, fee.batchId.name, res.data.fee, amountPaid);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error('Payment Error:', err);
            alert('Failed to record payment.');
        }
    };

    const generateReceiptPDF = (studentName, batchName, record, amountJustPaid) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241); // Accent color
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
                ['Total Monthly Fee Due', `Rs. ${record.dueAmount}`],
                ['Amount Paid Now', `Rs. ${amountJustPaid}`],
                ['Total Paid Till Date', `Rs. ${record.paidAmount}`],
                ['Remaining Balance', `Rs. ${record.dueAmount - record.paidAmount}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });
        doc.setFontSize(10);
        doc.text("Thank you for your timely payment.", 105, 200, { align: "center" });
        doc.save(`Receipt_${studentName}_${record.month}.pdf`);
    };

    const getStatusBadge = (status, dueDate) => {
        const isPastDue = new Date(dueDate) < new Date() && status !== 'Paid';
        if (status === 'Paid') return <span className="bg-emerald-400/10 text-emerald-400 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-emerald-400/20 flex items-center space-x-1.5 shadow-inner"><CheckCircle size={14} className="stroke-[3]" /><span>Settled</span></span>;
        if (isPastDue) return <span className="bg-rose-500/10 text-rose-500 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-rose-500/20 flex items-center space-x-1.5 shadow-inner animate-pulse"><AlertTriangle size={14} className="stroke-[3]" /><span>Defaulter</span></span>;
        if (status === 'Partial') return <span className="bg-amber-400/10 text-amber-400 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-amber-400/20 flex items-center space-x-1.5 shadow-inner"><Clock size={14} className="stroke-[3]" /><span>Fragmented</span></span>;
        return <span className="bg-white/5 text-gray-500 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-white/5 flex items-center space-x-1.5"><Clock size={14} /><span>Waiting</span></span>;
    };

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
            initial="hidden" animate="visible" variants={containerVariants}
            className="space-y-12 max-w-7xl mx-auto pb-20"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center mb-2">
                        <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20 mr-4 shadow-xl shadow-accent/10">
                            <IndianRupee className="text-accent" size={32} />
                        </div>
                        <span>Financial <span className="gradient-text">Ledger</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium tracking-tight">Systemic oversight of institutional credit and debit flows.</p>
                </div>

                <div className="flex bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-inner">
                    <div className="px-6 py-2 border-r border-white/10 text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Assets</p>
                        <p className="text-xl font-black text-white tracking-tighter">₹{fees.reduce((acc, f) => acc + f.paidAmount, 0).toLocaleString()}</p>
                    </div>
                    <div className="px-6 py-2 text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pending Flux</p>
                        <p className="text-xl font-black text-highlight tracking-tighter">₹{fees.reduce((acc, f) => acc + (f.dueAmount - f.paidAmount), 0).toLocaleString()}</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Invoice Generation */}
                <motion.div variants={itemVariants} className="lg:col-span-1 glass-card p-10 rounded-[3rem] border border-white/10 shadow-3xl h-fit relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <CreditCard size={140} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-8 border-b border-white/5 pb-4 tracking-tighter flex items-center">
                        <Zap size={24} className="text-accent mr-3" />
                        GENERATE DEBIT
                    </h2>
                    <form onSubmit={handleGenerateFees} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Target Cluster (Batch)</label>
                            <div className="relative">
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer" required
                                >
                                    <option value="" className="bg-surface text-gray-500 italic">-- Initialize Module --</option>
                                    {batches.map(b => <option key={b._id} value={b._id} className="bg-surface">{b.name}</option>)}
                                </select>
                                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-accent pointer-events-none" size={18} />
                            </div>
                            {selectedBatch && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-highlight text-[10px] font-black uppercase tracking-widest bg-highlight/5 px-3 py-1.5 rounded-xl border border-highlight/10 w-fit">
                                    <TrendingUp size={12} />
                                    <span>{students.length} NODES CONNECTED</span>
                                </motion.div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Cycle Label (Month)</label>
                            <div className="relative">
                                <input type="text" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} placeholder="e.g. MARCH 2026" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black placeholder-white/20 focus:outline-none focus:border-accent transition-all uppercase tracking-widest" required />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Maturity Date (Due)</label>
                            <input type="date" value={genDueDate} onChange={(e) => setGenDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-accent transition-all" required />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, shadow: "0 0 20px rgba(99,102,241,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-accent text-white py-5 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all shadow-xl shadow-accent/20 flex items-center justify-center space-x-2"
                        >
                            <span>DEPLOY INVOICES</span>
                            <ArrowRight size={18} className="stroke-[3]" />
                        </motion.button>
                    </form>
                </motion.div>

                {/* Ledger Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-4xl flex flex-col h-full min-h-[600px]">
                    <div className="p-8 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-2xl font-black text-white tracking-tighter flex items-center uppercase">
                            <Receipt size={24} className="text-highlight mr-4" />
                            Record Matrix
                        </h2>
                        <div className="flex bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            Filter: <span className="text-accent ml-2">{selectedBatch ? 'Targeted Node' : 'Global Net'}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                    <ShieldCheck size={48} />
                                </motion.div>
                                <p className="text-xs font-black uppercase tracking-[0.3em]">Synchronizing Vault...</p>
                            </div>
                        ) : fees.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-6 p-20 text-center opacity-20">
                                <Receipt size={80} className="text-gray-500" />
                                <div>
                                    <p className="text-2xl font-black uppercase tracking-[0.3em] mb-2 leading-none">Null Records</p>
                                    <p className="text-sm font-bold opacity-60">Initialize generation module to populate ledger entries.</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="p-6">Entity</th>
                                        <th className="p-6">Cycle / Maturity</th>
                                        <th className="p-6">Asset Value</th>
                                        <th className="p-6">Protocol</th>
                                        <th className="p-6 text-right">Operational</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {fees.map(f => (
                                        <motion.tr
                                            key={f._id}
                                            whileHover={{ backgroundColor: "rgba(255,255,255,0.01)" }}
                                            className="group transition-colors"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-surface border border-white/10 flex items-center justify-center text-accent font-black text-xs group-hover:scale-110 transition-transform shadow-inner">
                                                        {f.studentId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-sm tracking-tight leading-none mb-1 uppercase">{f.studentId?.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none opacity-60">{f.batchId?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-black text-white text-xs uppercase tracking-widest leading-none mb-2">{f.month}</p>
                                                <div className="flex items-center text-[10px] font-bold text-gray-500 leading-none">
                                                    <Clock size={12} className="mr-1.5 opacity-40" />
                                                    {format(new Date(f.dueDate), 'dd MMM yy')}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-black text-white text-lg tracking-tighter leading-none mb-1.5">₹{f.dueAmount}</p>
                                                {f.paidAmount > 0 && <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Realized: ₹{f.paidAmount}</span>}
                                            </td>
                                            <td className="p-6">
                                                {getStatusBadge(f.status, f.dueDate)}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {f.status !== 'Paid' ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(16,185,129,0.15)" }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handlePayFee(f)}
                                                            className="bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-400/20 shadow-inner flex items-center space-x-2"
                                                        >
                                                            <CreditCard size={14} />
                                                            <span>Collect</span>
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, color: "#fff" }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => generateReceiptPDF(f.studentId.name, f.batchId.name, f, f.dueAmount)}
                                                            className="p-3 text-highlight hover:bg-highlight/10 rounded-2xl transition-all border border-transparent hover:border-highlight/20"
                                                            title="Extract Receipt"
                                                        >
                                                            <Printer size={20} className="stroke-[2.5]" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};


export default FeeManagement;
