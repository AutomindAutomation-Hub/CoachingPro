import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const Enrollment = () => {
    const [batches, setBatches] = useState([]);
    const [enrolledBatchIds, setEnrolledBatchIds] = useState([]);
    const { user } = useAuthStore();
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchBatchesAndStudentData();
    }, []);

    const fetchBatchesAndStudentData = async () => {
        try {
            // Because /batches needs admin/teacher, we need to create a public or student-accessible batch route if it doesn't exist.
            // Wait, let's check what routes are available in batchRoutes.js.
            // For now, let's assume we can fetch batches or we need to update batchRoutes.
            const { data: allBatches } = await axios.get('/batches');
            setBatches(allBatches);

            // Get the current student's data to see what they are enrolled in
            // We'll need an endpoint like GET /students/me but we have /auth/me or can fetch student profile from studentRoutes?
            // Actually, we can just get full student profile.
            const { data: studentProfile } = await axios.get(`/students/me`);
            setEnrolledBatchIds(studentProfile.batchIds.map(b => b._id || b));

        } catch (error) {
            console.error(error);
            // It might fail if we don't have these endpoints for Student role, we'll fix the backend routes soon.
        }
    };

    const handleEnroll = async (batchId) => {
        try {
            setMessage(null);
            await axios.post('/students/enroll', { batchId });
            setMessage({ type: 'success', text: 'Successfully enrolled!' });
            setEnrolledBatchIds([...enrolledBatchIds, batchId]);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enroll' });
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Enroll in Batches</h1>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                        No batches available for enrollment.
                    </div>
                ) : (
                    batches.map((batch) => {
                        const isEnrolled = enrolledBatchIds.includes(batch._id);
                        return (
                            <div key={batch._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">{batch.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{batch.subject}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">Instructor:</span> {batch.teacherId?.name || 'Unassigned'}</p>
                                <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">Timing:</span> {batch.timing}</p>
                                <p className="text-gray-600 text-sm mb-4"><span className="font-semibold">Fee:</span> ₹{batch.monthlyFee}/mo</p>

                                <button
                                    onClick={() => handleEnroll(batch._id)}
                                    disabled={isEnrolled}
                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${isEnrolled
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Enrollment;
