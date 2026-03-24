import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { IndianRupee, Printer, AlertTriangle, CheckCircle, Clock, ShieldCheck, CreditCard, Receipt, Layers, Search, Zap } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const StudentFees = () => {
    const { user } = useAuthStore();
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/fees/student/${user?._id}`);
                setFees(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchFees();
    }, [user]);

    const handleOnlinePayment = async (fee) => {
        if (fee.status === 'Paid') return;

        const amountToPay = fee.dueAmount - fee.paidAmount;
        const confirmMsg = `Proceed to secure payment gateway to pay ₹${amountToPay} for ${fee.month}?`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const { data } = await axios.post(`/fees/${fee._id}/pay-online`, { amountPaid: amountToPay });

            const paidFee = data.fee;
            generateReceiptPDF(user.name, fee.batchId.name, paidFee, amountToPay);

            const feeRes = await axios.get(`/fees/student/${user._id}`);
            setFees(feeRes.data);

        } catch (err) {
            alert(err.response?.data?.message || 'Payment Failed');
        }
        setLoading(false);
    };

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
                            <IndianRupee className="text-accent" size={32} />
                        </div>
                        <span>Financial <span className="gradient-text">Ledger</span></span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Manage your resource credits and transaction certificates.</p>
                </div>
            </div>

            <motion.div
                variants={itemVariants}
                className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-4xl"
            >
                <div className="p-8 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center uppercase">
                        <Receipt size={20} className="text-accent mr-3" />
                        Transaction History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {fees.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="flex flex-col items-center opacity-20">
                                <Search size={64} className="mb-6 text-gray-600" />
                                <p className="text-2xl font-black uppercase tracking-[0.3em]">No Records Found</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="p-8">Temporal Unit / Deadline</th>
                                    <th className="p-8">Operations Node</th>
                                    <th className="p-8">Resource Value</th>
                                    <th className="p-8">Status</th>
                                    <th className="p-8 text-right">Commit Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {fees.map(f => (
                                    <motion.tr
                                        key={f._id}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                        className="transition-colors group"
                                    >
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <p className="font-black text-white text-lg tracking-tight group-hover:text-accent transition-colors">{f.month}</p>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expires: {format(new Date(f.dueDate), 'dd MMM yyyy')}</p>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center space-x-2">
                                                <div className="p-1 px-3 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-gray-400">
                                                    {f.batchId?.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <p className="font-black text-white text-xl tracking-tighter group-hover:text-highlight transition-colors flex items-center">
                                                    <IndianRupee size={16} className="mr-0.5" />
                                                    {f.dueAmount}
                                                </p>
                                                {f.paidAmount > 0 && (
                                                    <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                        <ShieldCheck size={10} />
                                                        <span>Synced: ₹{f.paidAmount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            {getStatusBadge(f.status, f.dueDate)}
                                        </td>
                                        <td className="p-8 text-right">
                                            {f.status !== 'Paid' ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05, shadow: "0 0 20px rgba(99,102,241,0.3)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleOnlinePayment(f)}
                                                    className="bg-accent text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-lg flex items-center space-x-2 ml-auto"
                                                >
                                                    <CreditCard size={14} />
                                                    <span>Pay ₹{f.dueAmount - f.paidAmount}</span>
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.1, color: "#22d3ee" }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => generateReceiptPDF(user.name, f.batchId?.name, f, f.dueAmount)}
                                                    className="p-3 bg-white/5 border border-white/10 text-gray-400 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center space-x-2 ml-auto group/btn"
                                                    title="Download Receipt"
                                                >
                                                    <Printer size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">CERTIFICATE</span>
                                                </motion.button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default StudentFees;
