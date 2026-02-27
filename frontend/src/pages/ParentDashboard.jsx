import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Users, FileText, IndianRupee, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ParentDashboard = () => {
    const { user } = useAuthStore();
    const [childrenData, setChildrenData] = useState([]);
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

                // Fetch Fees for all kids
                const kidsWithFees = await Promise.all(myKids.map(async (kid) => {
                    const feeRes = await axios.get(`/fees/student/${kid.userId._id}`);
                    return { student: kid, fees: feeRes.data };
                }));

                setChildrenData(kidsWithFees);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchParentData();
    }, [user._id]);

    const handleOnlinePayment = async (fee) => {
        if (fee.status === 'Paid') return;

        const amountToPay = fee.dueAmount - fee.paidAmount;
        const confirmMsg = `Proceed to secure payment gateway to pay ₹${amountToPay} for ${fee.month}?`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const { data } = await axios.post(`/fees/${fee._id}/pay-online`, { amountPaid: amountToPay });
            alert(`Payment Successful! TXN ID: ${data.fee.receiptId}`);

            // Refresh data
            const { data: myKids } = await axios.get('/auth/parent/children');
            if (myKids.length > 0) {
                const kidsWithFees = await Promise.all(myKids.map(async (kid) => {
                    const feeRes = await axios.get(`/fees/student/${kid.userId._id}`);
                    return { student: kid, fees: feeRes.data };
                }));
                setChildrenData(kidsWithFees);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Payment Failed');
        }
        setLoading(false);
    };

    const getStatusBadge = (status, dueDate) => {
        const isPastDue = new Date(dueDate) < new Date() && status !== 'Paid';

        if (status === 'Paid') return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><CheckCircle size={14} /><span>Paid</span></span>;
        if (isPastDue) return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><AlertTriangle size={14} /><span>Defaulter</span></span>;
        if (status === 'Partial') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold">Partial</span>;
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center max-w-min space-x-1"><Clock size={14} /><span>Pending</span></span>;
    };

    if (loading) return <div className="p-8 text-center">Loading Parent Portal...</div>;

    if (childrenData.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                <Users size={64} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-2xl font-bold text-gray-600 mb-2">No Linked Students Found</h2>
                <p className="text-gray-500">Please contact the Administrator to link your child's profile to your Parent Account.</p>
            </div>
        );
    }

    const { student, fees } = childrenData[0]; // Just showing first child for dashboard brevity

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-emerald-700 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center bg-opacity-95 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Parent Portal</h1>
                    <p className="opacity-80 font-medium">Monitoring progress for: <span className="underline font-bold text-emerald-100">{student.userId.name}</span></p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Notice Board & Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Quick Insights</h2>

                    <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-4 border border-blue-100">
                        <Activity className="text-blue-500 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-blue-900">Academic Trajectory is Positive</h3>
                            <p className="text-sm text-blue-700 mt-1">{student.userId.name} scored 85% in their last mock test. Keep it up!</p>
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl flex items-start space-x-4 border border-red-100">
                        <AlertTriangle className="text-red-500 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-red-900">Attendance Alert</h3>
                            <p className="text-sm text-red-700 mt-1">{student.userId.name} has missed 2 classes this month. Please ensure regularity.</p>
                        </div>
                    </div>
                </div>

                {/* Fee Ledger */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center space-x-2">
                        <IndianRupee size={20} className="text-indigo-600" />
                        <span>Recent Fee Details</span>
                    </h2>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {fees.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No fee records generated yet.</p>
                        ) : fees.slice(0, 4).map(f => (
                            <div key={f._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition border border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-800">{f.month}</p>
                                    <p className="text-xs text-gray-500">Due: {format(new Date(f.dueDate), 'dd MMM yyyy')}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-bold text-gray-800">₹{f.dueAmount}</p>
                                    {getStatusBadge(f.status, f.dueDate)}
                                    {f.status !== 'Paid' && (
                                        <button
                                            onClick={() => handleOnlinePayment(f)}
                                            className="mt-2 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ParentDashboard;
