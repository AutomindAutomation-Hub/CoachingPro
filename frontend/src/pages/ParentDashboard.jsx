import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Users, IndianRupee, Activity, CheckCircle, Clock, AlertTriangle, Calendar, Award, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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

                // Fetch Fees, Attendance, and Tests for all kids
                const kidsWithData = await Promise.all(myKids.map(async (kid) => {
                    const studentId = kid.userId._id;
                    const feePromise = axios.get(`/fees/student/${studentId}`);
                    const attendancePromise = axios.get(`/attendance/student/${studentId}`);
                    const testsPromise = axios.get(`/tests/student/${studentId}`);

                    const [feeRes, attendanceRes, testsRes] = await Promise.all([feePromise, attendancePromise, testsPromise]);

                    // Calculate Attendance Percentage
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
            alert(`Payment Successful! TXN ID: ${data.fee.receiptId}`);

            // Generate receipt
            const paidFee = data.fee;
            const currentChild = childrenData[selectedChildIndex];
            generateReceiptPDF(currentChild.student.userId.name, fee.batchId?.name || 'Batch', paidFee, amountToPay);

            // Refresh data (could be optimized, but ok for now)
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

    const currentChildData = childrenData[selectedChildIndex];
    const { student, fees, attendance, tests, attendanceStats } = currentChildData;

    // Find latest test score
    const latestTest = tests[tests.length - 1]; // tests are sorted ascending by date from API
    const latestTestResult = latestTest?.results?.find(r => r.studentId === student.userId._id);
    const latestTestScoreMsg = latestTestResult ? `${latestTestResult.marksObtained} / ${latestTest.maxMarks} in ${latestTest.testName}` : 'No tests taken yet';

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header / Child Selector */}
            <div className="bg-emerald-700 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center bg-opacity-95 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-1">Parent Portal</h1>
                    <p className="opacity-80 font-medium">Monitoring progress and activities.</p>
                </div>

                {childrenData.length > 1 && (
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <select
                            className="bg-transparent text-white font-bold outline-none cursor-pointer p-2 w-full"
                            value={selectedChildIndex}
                            onChange={(e) => setSelectedChildIndex(Number(e.target.value))}
                        >
                            {childrenData.map((data, idx) => (
                                <option key={data.student._id} value={idx} className="text-gray-800">
                                    {data.student.userId.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className={`p-4 rounded-full ${attendanceStats.percentage >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Activity size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Attendance</p>
                        <h3 className="text-2xl font-bold text-gray-800">{attendanceStats.percentage}%</h3>
                        <p className="text-xs text-gray-500 mt-1">{attendanceStats.presentClasses} of {attendanceStats.totalClasses} classes attended</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                        <Award size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Latest Test Score</p>
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{latestTestScoreMsg}</h3>
                        {latestTest && <p className="text-xs text-gray-500 mt-1">{format(new Date(latestTest.date), 'dd MMM yyyy')}</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 rounded-full bg-indigo-100 text-indigo-600">
                        <IndianRupee size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Next Fee Due</p>
                        {fees.length > 0 ? (
                            <>
                                <h3 className="text-xl font-bold text-gray-800">₹{fees[0].dueAmount - fees[0].paidAmount}</h3>
                                <p className="text-xs text-gray-500 mt-1">Due: {format(new Date(fees[0].dueDate), 'dd MMM yyyy')}</p>
                            </>
                        ) : (
                            <h3 className="text-xl font-bold text-gray-800">No Dues</h3>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Academic Tracking - Attendance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center space-x-2">
                        <Calendar size={20} className="text-emerald-500" />
                        <span>Recent Attendance</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto max-h-80 pr-2 space-y-2">
                        {attendance.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No attendance records found.</p>
                        ) : attendance.map(rec => (
                            <div key={rec._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-800">{format(new Date(rec.date), 'dd MMM yyyy')}</p>
                                    <p className="text-xs text-gray-500">{rec.batchId?.name || 'Unknown Batch'}</p>
                                </div>
                                <div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${rec.status === 'Present' ? 'bg-green-100 text-green-800' :
                                        rec.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {rec.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Academic Tracking - Tests */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center space-x-2">
                        <Award size={20} className="text-blue-500" />
                        <span>Test Performance</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto max-h-80 pr-2 space-y-3">
                        {tests.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No test records found.</p>
                        ) : [...tests].reverse().map(test => { // reverse for descending display
                            const myResult = test.results.find(r => r.studentId === student.userId._id);
                            if (!myResult) return null;

                            const percentage = Math.round((myResult.marksObtained / test.maxMarks) * 100);

                            return (
                                <div key={test._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-800">{test.testName}</p>
                                            <p className="text-xs text-gray-500">{format(new Date(test.date), 'dd MMM yyyy')} | {test.batchId?.name || 'Batch'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-700 text-lg">{myResult.marksObtained} <span className="text-sm text-gray-500">/ {test.maxMarks}</span></p>
                                        </div>
                                    </div>

                                    {/* Small Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div
                                            className={`h-1.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-[10px] text-gray-400 mt-1">{percentage}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fee Ledger */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center space-x-2">
                        <IndianRupee size={20} className="text-indigo-600" />
                        <span>Recent Fee Details</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {fees.length === 0 ? (
                            <p className="text-sm text-gray-500 col-span-2 py-2">No fee records generated yet.</p>
                        ) : fees.slice(0, 4).map(f => (
                            <div key={f._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition border border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-800">{f.month}</p>
                                    <p className="text-xs text-gray-500">Due: {format(new Date(f.dueDate), 'dd MMM yyyy')}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-bold text-gray-800">₹{f.dueAmount}</p>
                                    {getStatusBadge(f.status, f.dueDate)}
                                    {f.status !== 'Paid' ? (
                                        <button
                                            onClick={() => handleOnlinePayment(f)}
                                            className="mt-2 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                                        >
                                            Pay ₹{f.dueAmount - f.paidAmount} Now
                                        </button>
                                    ) : (
                                        <button onClick={() => {
                                            const currentChild = childrenData.find(c => c.student.userId._id === f.studentId);
                                            generateReceiptPDF(currentChild?.student.userId.name || 'Student', f.batchId?.name || 'Batch', f, f.dueAmount);
                                        }} className="text-blue-600 hover:text-blue-800 flex flex-col items-center justify-end w-full" title="Download Receipt">
                                            <Printer size={20} />
                                            <span className="text-[10px] uppercase font-bold mt-1">Receipt</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notice Board */}
                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 md:col-span-2">
                    <h2 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2 mb-3">Institute Announcements</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start space-x-3 text-sm text-blue-800">
                            <span className="mt-0.5 text-blue-500">▶</span>
                            <span>Next Parent-Teacher Meeting is scheduled for the last Saturday of this month.</span>
                        </li>
                        <li className="flex items-start space-x-3 text-sm text-blue-800">
                            <span className="mt-0.5 text-blue-500">▶</span>
                            <span>Please clear any pending dues before the upcoming mid-term exams.</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default ParentDashboard;
