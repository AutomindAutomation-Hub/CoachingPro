import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { IndianRupee, Printer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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
            alert(`Payment Successful! TXN ID: ${data.fee.receiptId}`);

            // Generate PDF Receipt immediately on payment
            const paidFee = data.fee;
            generateReceiptPDF(user.name, fee.batchId.name, paidFee, amountToPay);

            // Refresh data
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

        if (status === 'Paid') return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><CheckCircle size={14} /><span>Paid</span></span>;
        if (isPastDue) return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><AlertTriangle size={14} /><span>Defaulter</span></span>;
        if (status === 'Partial') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold">Partial</span>;
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><Clock size={14} /><span>Pending</span></span>;
    };

    if (loading) return <div className="p-8 text-center">Loading Fees...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3 mb-8">
                <IndianRupee className="text-indigo-600" size={32} />
                <span>My Fees & Payments</span>
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Fee Ledger</h2>
                </div>

                <div className="overflow-x-auto p-4">
                    {fees.length === 0 ? (
                        <div className="text-center text-gray-500 p-8">
                            <p className="text-lg font-semibold mb-2">No fee records found.</p>
                            <p>You currently do not have any fee dues generated.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                    <th className="pb-3 text-left font-semibold">Month / Due Date</th>
                                    <th className="pb-3 text-left font-semibold">Batch</th>
                                    <th className="pb-3 text-left font-semibold">Amount Due</th>
                                    <th className="pb-3 text-left font-semibold">Status</th>
                                    <th className="pb-3 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fees.map(f => (
                                    <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4">
                                            <p className="font-medium text-gray-800">{f.month}</p>
                                            <p className="text-xs text-gray-500">Due: {format(new Date(f.dueDate), 'dd MMM yyyy')}</p>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-sm text-gray-600">{f.batchId?.name}</p>
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
                                                <button onClick={() => handleOnlinePayment(f)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm">
                                                    Pay ₹{f.dueAmount - f.paidAmount} Now
                                                </button>
                                            ) : (
                                                <button onClick={() => generateReceiptPDF(user.name, f.batchId?.name, f, f.dueAmount)} className="text-blue-600 hover:text-blue-800 flex flex-col items-center justify-end w-full" title="Download Receipt">
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
    );
};

export default StudentFees;
