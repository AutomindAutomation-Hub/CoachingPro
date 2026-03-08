import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AttendanceGrid = () => {
    const { user } = useAuthStore();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]); // { studentId: status }
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch batches based on role
    useEffect(() => {
        const url = user?.role === 'Teacher' ? '/teacher/my-batches' : '/batches';
        axios.get(url).then(res => setBatches(res.data));
    }, [user?.role]);

    // When batch or date changes, fetch students AND existing attendance
    useEffect(() => {
        if (!selectedBatch) return;
        setLoading(true);
        setMessage(null);

        // This is complex - usually we'd have a single API for "Get Roster with Attendance for Date"
        // For Phase 2, let's fetch students, then fetch attendance records and merge them
        const loadRoster = async () => {
            try {
                // 1. Get all students (In real app, get students specific to this batch)
                const stuRes = await axios.get('/students');
                // Filter locally for now
                const batchStudents = stuRes.data.filter(s => s.batchIds?.some(b => (b._id || b) === selectedBatch));
                setStudents(batchStudents);

                // 2. Get existing attendance
                const attRes = await axios.get(`/attendance/${selectedBatch}/${date}`);

                // Map it
                const existingData = {};
                // Pre-fill default status as 'Present' for new, or existing status
                batchStudents.forEach(stu => {
                    const record = attRes.data.find(r => r.studentId._id === stu.userId._id);
                    existingData[stu.userId._id] = record ? record.status : 'Present';
                });
                setAttendanceData(existingData);

            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        loadRoster();
    }, [selectedBatch, date]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const submitBulkAttendance = async () => {
        if (!selectedBatch) return;
        setLoading(true);
        const payload = Object.keys(attendanceData).map(stId => ({
            studentId: stId,
            status: attendanceData[stId]
        }));

        try {
            await axios.post('/attendance/bulk', {
                batchId: selectedBatch,
                date,
                attendanceData: payload
            });
            setMessage({ type: 'success', text: 'Attendance updated and notifications triggered!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance.' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Attendance Register</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="">-- Choose Batch --</option>
                        {batches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.subject}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-800"
                    />
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <AlertCircle size={20} />
                    <span>{message.text}</span>
                </div>
            )}

            {selectedBatch && !loading && students.length === 0 && (
                <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                    No students currently enrolled in this batch.
                </div>
            )}

            {selectedBatch && students.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Student Name</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const id = student.userId._id;
                                const status = attendanceData[id] || 'Present';
                                return (
                                    <tr key={id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{student.userId.name}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleStatusChange(id, 'Present')}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${status === 'Present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}
                                                >Present</button>
                                                <button
                                                    onClick={() => handleStatusChange(id, 'Absent')}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${status === 'Absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}
                                                >Absent</button>
                                                <button
                                                    onClick={() => handleStatusChange(id, 'Late')}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${status === 'Late' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'}`}
                                                >Late</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={submitBulkAttendance}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-blue-700 font-semibold disabled:opacity-50"
                        >
                            <Save size={20} />
                            <span>{loading ? 'Saving...' : 'Save & Send SMS'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceGrid;
