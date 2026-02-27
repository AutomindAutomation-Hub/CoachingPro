import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IndianRupee, Printer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const FeeManagement = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [fees, setFees] = useState([]);
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
            alert('Fees generated for all students in the batch successfully!');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating fees');
        }
    };

    const handlePayFee = async (fee) => {
        const amountStr = prompt(`Enter amount paid by ${fee.studentId.name} for ${fee.month}:\n(Due: ₹${fee.dueAmount - fee.paidAmount})`, (fee.dueAmount - fee.paidAmount).toString());
        if (!amountStr) return;

        const amountPaid = Number(amountStr);
        if (isNaN(amountPaid) || amountPaid <= 0) return alert('Invalid amount');

        try {
            const res = await axios.put(`/fees/${fee._id}/pay`, { amountPaid });

            // Generate PDF Receipt immediately on payment
            const paidFee = res.data.fee;
            generateReceiptPDF(fee.studentId.name, fee.batchId.name, paidFee, amountPaid);

            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert('Failed to record payment');
        }
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

        doc.autoTable({
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

        if (status === 'Paid') return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><CheckCircle size={14} /><span>Paid</span></span>;
        if (isPastDue) return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><AlertTriangle size={14} /><span>Defaulter</span></span>;
        if (status === 'Partial') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold">Partial</span>;
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><Clock size={14} /><span>Pending</span></span>;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <IndianRupee className="text-green-600" size={32} />
                <span>Fee Management & Collections</span>
            </h1>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 font-sans h-max">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Generate Monthly Dues</h2>
                    <form onSubmit={handleGenerateFees} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Batch</label>
                            <select
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg" required
                            >
                                <option value="">Select a batch</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month Label</label>
                            <input type="text" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} placeholder="e.g. March 2026" className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input type="date" value={genDueDate} onChange={(e) => setGenDueDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white p-2.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                            Generate Invoices
                        </button>
                    </form>
                </div>

                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Fee Ledgers & Defaulters</h2>
                        <span className="text-sm text-gray-500">Filter applied: {selectedBatch ? 'Specific Batch' : 'All Batches (Global)'}</span>
                    </div>

                    <div className="overflow-x-auto p-4 max-h-[600px]">
                        {loading ? <p className="text-center p-4">Loading ledger...</p> : fees.length === 0 ? <p className="text-center text-gray-400 p-8">No fee records found. Generate them first.</p> : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        <th className="pb-3 text-left font-semibold">Student</th>
                                        <th className="pb-3 text-left font-semibold">Month / Due Date</th>
                                        <th className="pb-3 text-left font-semibold">Amount Due</th>
                                        <th className="pb-3 text-left font-semibold">Status</th>
                                        <th className="pb-3 text-right font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.map(f => (
                                        <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4">
                                                <p className="font-bold text-gray-800">{f.studentId?.name}</p>
                                                <p className="text-xs text-gray-500">{f.batchId?.name}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="font-medium text-gray-800">{f.month}</p>
                                                <p className="text-xs text-gray-500">Due: {format(new Date(f.dueDate), 'dd MMM yyyy')}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="font-bold text-gray-800">₹{f.dueAmount}</p>
                                                {f.paidAmount > 0 && <p className="text-xs text-green-600 font-semibold">Paid: ₹{f.paidAmount}</p>}
                                            </td>
                                            <td className="py-4">
                                                {getStatusBadge(f.status, f.dueDate)}
                                            </td>
                                            <td className="py-4 text-right">
                                                {f.status !== 'Paid' ? (
                                                    <button onClick={() => handlePayFee(f)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold hover:bg-green-200 transition">
                                                        Collect Payment
                                                    </button>
                                                ) : (
                                                    <button onClick={() => generateReceiptPDF(f.studentId.name, f.batchId.name, f, f.dueAmount)} className="text-blue-600 hover:text-blue-800 flex flex-col items-center justify-end w-full" title="Re-download Receipt">
                                                        <Printer size={20} />
                                                        <span className="text-[10px] uppercase font-bold mt-1">Receipt</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeManagement;
