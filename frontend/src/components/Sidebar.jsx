import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Users, BookOpen, Layers, Settings, LogOut, Home, FileText, QrCode, ClipboardList, IndianRupee, TrendingUp, BrainCircuit } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: Home, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
        { name: 'Enrollment', path: '/enrollment', icon: Layers, roles: ['Student'] },
        { name: 'Students', path: '/students', icon: Users, roles: ['Admin'] },
        { name: 'Teachers', path: '/teachers', icon: Users, roles: ['Admin'] },
        { name: 'Batches', path: '/batches', icon: Layers, roles: ['Admin', 'Teacher'] },
        { name: 'Attendance', path: '/attendance', icon: FileText, roles: ['Admin', 'Teacher'] },
        { name: 'QR Scan', path: '/scan-qr', icon: QrCode, roles: ['Admin', 'Teacher'] },
        { name: 'Materials', path: '/materials', icon: BookOpen, roles: ['Admin', 'Teacher', 'Student'] },
        { name: 'Online Quizzes', path: '/quizzes', icon: BrainCircuit, roles: ['Admin', 'Teacher', 'Student'] },
        { name: 'Tests & Marks', path: '/marks-entry', icon: ClipboardList, roles: ['Admin', 'Teacher'] },
        { name: 'My Progress', path: '/progress', icon: TrendingUp, roles: ['Student', 'Parent'] },
        { name: 'Fee Ledger', path: '/fees', icon: IndianRupee, roles: ['Admin'] },
    ];

    return (
        <aside className={`fixed md:sticky top-0 left-0 z-40 bg-gray-900 text-white w-64 min-h-screen flex flex-col transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-blue-400">CoachingPro</h2>
                    {user && <p className="text-sm text-gray-400 mt-2">Welcome, {user.name} ({user.role})</p>}
                </div>
                {/* Mobile close button */}
                <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                    &times;
                </button>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto w-[calc(100%+8px)] pr-[8px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {navItems.filter(item => user && item.roles.includes(user.role)).map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
