import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ClipboardList, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MarksEntry = () => {
    const { user } = useAuthStore();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);

    // Test form details
    const [testName, setTestName] = useState('');
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [maxMarks, setMaxMarks] = useState(100);
    const [marksData, setMarksData] = useState({}); // { studentId: value }

    // Existing tests in batch
    const [existingTests, setExistingTests] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState('new'); // 'new' vs specific test id
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const url = user?.role === 'Teacher' ? '/teacher/my-batches' : '/batches';
        axios.get(url).then(res => setBatches(res.data));
    }, [user?.role]);

    // Load students and tests when batch changes
    useEffect(() => {
        if (!selectedBatch) return;
        setLoading(true);
        setMessage(null);

        const loadBatchData = async () => {
            try {
                // Get batch roster
                const stuRes = await axios.get('/students');
                const batchStudents = stuRes.data.filter(s => s.batchIds?.includes(selectedBatch));
                setStudents(batchStudents);

                // Init blank marks mapping for 'new'
                const blankData = {};
                batchStudents.forEach(s => blankData[s.userId._id] = '');

                // Get existing tests
                const testRes = await axios.get(`/tests/${selectedBatch}`);
                setExistingTests(testRes.data);

                if (selectedTestId === 'new') {
                    setTestName('');
                    setMaxMarks(100);
                    setMarksData(blankData);
                }

            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        loadBatchData();
    }, [selectedBatch, selectedTestId]);

    // Handle test selection toggle
    useEffect(() => {
        if (!selectedBatch || students.length === 0) return;

        if (selectedTestId === 'new') {
            const blankData = {};
            students.forEach(s => blankData[s.userId._id] = '');
            setMarksData(blankData);
            setTestName('');
            setMaxMarks(100);
            return;
        }

        // Load specific test marks into state
        const test = existingTests.find(t => t._id === selectedTestId);
        if (test) {
            setTestName(test.testName);
            setTestDate(new Date(test.date).toISOString().split('T')[0]);
            setMaxMarks(test.maxMarks);
            const loadedMarks = {};
            students.forEach(s => loadedMarks[s.userId._id] = ''); // Set default

            test.results.forEach(res => {
                if (res.studentId) { // Check if student still exists
                    loadedMarks[res.studentId._id] = res.status === 'Absent' ? 'A' : res.marksObtained;
                }
            });
            setMarksData(loadedMarks);
        }
    }, [selectedTestId, existingTests, students]);

    const handleMarksChange = (studentId, val) => {
        setMarksData(prev => ({ ...prev, [studentId]: val }));
    };

    const submitMarks = async () => {
        if (!selectedBatch || !testName || !maxMarks) {
            setMessage({ type: 'error', text: 'Please fill name and max marks' });
            return;
        }

        setLoading(true);
        const resultsArray = Object.keys(marksData).map(stId => {
            const val = marksData[stId];
            return {
                studentId: stId,
                status: (val === 'A' || val === 'a') ? 'Absent' : 'Present',
                marksObtained: (val === 'A' || val === 'a' || val === '') ? 0 : Number(val)
            };
        });

        try {
            if (selectedTestId === 'new') {
                const res = await axios.post('/tests', {
                    batchId: selectedBatch,
                    testName,
                    date: testDate,
                    maxMarks,
                    results: resultsArray
                });
                setMessage({ type: 'success', text: 'New test marks saved successfully!' });

                // Refresh existing tests list
                const testRes = await axios.get(`/tests/${selectedBatch}`);
                setExistingTests(testRes.data);
                setSelectedTestId(res.data._id); // switch to edit mode of new test
            } else {
                await axios.put(`/tests/${selectedTestId}`, {
                    results: resultsArray
                });
                setMessage({ type: 'success', text: 'Test marks updated successfully!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save marks' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <ClipboardList className="text-blue-600" size={32} />
                <span>Test & Marks Entry</span>
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => { setSelectedBatch(e.target.value); setSelectedTestId('new'); }}
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                    >
                        <option value="">-- Choose Batch --</option>
                        {batches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.subject}</option>)}
                    </select>
                </div>

                {selectedBatch && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action / Test File</label>
                        <select
                            value={selectedTestId}
                            onChange={(e) => setSelectedTestId(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-blue-700 font-medium bg-blue-50"
                        >
                            <option value="new">+ Create New Test Record</option>
                            {existingTests.map(t => (
                                <option key={t._id} value={t._id}>Edit: {t.testName} ({new Date(t.date).toLocaleDateString()})</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg font-medium text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {selectedBatch && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div className="grid md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                            <input
                                type="text" value={testName} onChange={(e) => setTestName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g. Weekly Mock 1" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                            <input
                                type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg" required min="1"
                            />
                        </div>
                    </div>

                    {students.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No students found in this batch to grade.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-blue-600 text-white text-sm uppercase">
                                        <th className="p-3 rounded-tl-lg font-semibold">Student Name</th>
                                        <th className="p-3 font-semibold w-48 text-center">Marks Obtained</th>
                                        <th className="p-3 rounded-tr-lg font-semibold w-24">Grade %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, i) => {
                                        const id = student.userId._id;
                                        const val = marksData[id] || '';
                                        const numVal = Number(val);
                                        const percent = (!isNaN(numVal) && maxMarks > 0) ? ((numVal / maxMarks) * 100).toFixed(1) : '-';

                                        return (
                                            <tr key={id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                <td className="p-3 font-medium text-gray-700">{student.userId.name}</td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="text"
                                                        value={val}
                                                        onChange={(e) => handleMarksChange(id, e.target.value)}
                                                        className="w-24 p-1.5 text-center border border-gray-300 rounded font-bold text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Marks / 'A'"
                                                    />
                                                </td>
                                                <td className="p-3 text-gray-500 font-semibold">{val === 'A' ? 'Absent' : `${percent}%`}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={submitMarks}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 font-bold hover:bg-green-700 shadow-md hover:shadow-lg transition disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    <span>{selectedTestId === 'new' ? 'Save New Marks' : 'Update Record'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarksEntry;
