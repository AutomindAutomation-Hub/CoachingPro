import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Batches from './pages/Batches';
import AttendanceGrid from './pages/AttendanceGrid';
import QRScanning from './pages/QRScanning';
import Materials from './pages/Materials';
import ParentDashboard from './pages/ParentDashboard';
import MarksEntry from './pages/MarksEntry';
import FeeManagement from './pages/FeeManagement';
import StudentProgress from './pages/StudentProgress';
import Quizzes from './pages/Quizzes';
import Enrollment from './pages/Enrollment';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import axios from 'axios';

// Configure Axios
axios.defaults.baseURL = 'http://localhost:5000/api';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" />;
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Or unauthorized page
  }
  return children;
};

const DashboardHome = () => {
  const { user } = useAuthStore();
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Teacher') return <TeacherDashboard />;
  if (user?.role === 'Student') return <StudentDashboard />;
  if (user?.role === 'Parent') return <ParentDashboard />;
  return null;
};

function App() {
  const { token, initUser, logout } = useAuthStore();

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get('/auth/me');
          initUser(data);
        } catch (error) {
          console.error("Auth error", error);
          logout();
        }
      }
    };
    fetchUser();
  }, [token, initUser, logout]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes inside Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="students" element={<ProtectedRoute allowedRoles={['Admin']}><Students /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute allowedRoles={['Admin']}><Teachers /></ProtectedRoute>} />
          <Route path="batches" element={<ProtectedRoute allowedRoles={['Admin', 'Teacher']}><Batches /></ProtectedRoute>} />

          {/* Phase 2 Routes */}
          <Route path="attendance" element={<ProtectedRoute allowedRoles={['Admin', 'Teacher']}><AttendanceGrid /></ProtectedRoute>} />
          <Route path="scan-qr" element={<ProtectedRoute allowedRoles={['Admin', 'Teacher']}><QRScanning /></ProtectedRoute>} />
          <Route path="materials" element={<Materials />} />

          {/* Phase 3 Routes */}
          <Route path="marks-entry" element={<ProtectedRoute allowedRoles={['Admin', 'Teacher']}><MarksEntry /></ProtectedRoute>} />
          <Route path="fees" element={<ProtectedRoute allowedRoles={['Admin']}><FeeManagement /></ProtectedRoute>} />
          <Route path="progress" element={<ProtectedRoute allowedRoles={['Student', 'Parent']}><StudentProgress /></ProtectedRoute>} />
          <Route path="enrollment" element={<ProtectedRoute allowedRoles={['Student']}><Enrollment /></ProtectedRoute>} />

          {/* Phase 4 Routes */}
          <Route path="quizzes" element={<ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Student']}><Quizzes /></ProtectedRoute>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
