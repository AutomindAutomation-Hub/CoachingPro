import { useAuthStore } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import { BookOpen, TrendingUp, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuthStore();

    // We stringify the JSON payload for QR code
    const qrPayload = JSON.stringify({ s: user?._id });

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-lg text-white flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Hello, {user?.name}! 👋</h1>
                    <p className="text-blue-100 group">Welcome to your student portal.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ID Card / QR Code Component */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 w-full text-center border-b pb-4">Digital ID Card</h2>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                        {/* We use QRCodeSVG component to generate real-time SVG QR */}
                        <QRCodeSVG
                            value={qrPayload}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#1f2937"}
                            level={"H"}
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-lg font-bold text-gray-800">{user?.name}</p>
                        <p className="text-gray-500">{user?.email}</p>
                        <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase mt-2">Student ID: {user?._id.slice(-6)}</p>
                    </div>

                    <p className="text-sm text-gray-400 mt-8 text-center bg-gray-50 px-4 py-2 rounded-lg">
                        Show this QR code to your teacher's scanner to mark daily attendance.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6 flex flex-col justify-center">
                    <Link to="/materials" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center space-x-6 hover:shadow-md transition group">
                        <div className="p-5 bg-yellow-100 text-yellow-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <BookOpen size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Study Materials</h3>
                            <p className="text-gray-500">Download notes, PDFs, and homework assigned by your teachers.</p>
                        </div>
                    </Link>

                    <Link to="/progress" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center space-x-6 hover:shadow-md transition group">
                        <div className="p-5 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Progress & Marks</h3>
                            <p className="text-gray-500">Track your mock test results, grades, and academic trajectory.</p>
                        </div>
                    </Link>

                    <Link to="/quizzes" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center space-x-6 hover:shadow-md transition group">
                        <div className="p-5 bg-purple-100 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <BrainCircuit size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Online Quizzes</h3>
                            <p className="text-gray-500">Take active MCQ quizzes specifically assigned to your batch.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
