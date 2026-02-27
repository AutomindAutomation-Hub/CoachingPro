import { BookOpen, Users, FileText, QrCode } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
    const { user } = useAuthStore();
    const [myBatches, setMyBatches] = useState([]);

    useEffect(() => {
        const fetchMyBatches = async () => {
            try {
                const { data } = await axios.get('/teacher/my-batches');
                setMyBatches(data);
            } catch (error) {
                console.error("Failed to fetch batches", error);
            }
        };
        fetchMyBatches();
    }, []);

    // We will show quick links for teachers
    const actions = [
        { title: 'My Batches', desc: 'View assigned classes', icon: Users, color: 'bg-blue-500', link: '/batches' },
        { title: 'Mark Attendance', desc: 'Manual Entry & Grid', icon: FileText, color: 'bg-green-500', link: '/attendance' },
        { title: 'QR Scan Attendance', desc: 'Scan student ID cards', icon: QrCode, color: 'bg-purple-500', link: '/scan-qr' },
        { title: 'Study Material', desc: 'Upload Notes/Docs', icon: BookOpen, color: 'bg-yellow-500', link: '/materials' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}!</h2>
                <p className="text-gray-600">Here's your quick access panel for managing your daily instructional duties.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {actions.map((action, i) => (
                    <Link to={action.link} key={i} className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center hover:shadow-md transition cursor-pointer border border-gray-100 group">
                        <div className={`p-4 rounded-full text-white ${action.color} group-hover:scale-110 transition-transform mb-4`}>
                            <action.icon size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 text-center">{action.title}</h3>
                        <p className="text-sm text-gray-500 text-center mt-2">{action.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Teacher's Batches Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Assigned Batches</h2>
                {myBatches.length === 0 ? (
                    <p className="text-gray-500 text-sm">You have not been assigned to any batches yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myBatches.map(batch => (
                            <div key={batch._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-bold text-gray-800">{batch.name}</h3>
                                <p className="text-sm text-blue-600 font-semibold mb-2">{batch.subject}</p>
                                <p className="text-sm text-gray-600">Timing: {batch.timing}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
