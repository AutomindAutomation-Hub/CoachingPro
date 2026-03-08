import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Students = () => {
    const { user } = useAuthStore();
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchParents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/students');
            setStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchParents = async () => {
        try {
            const { data } = await axios.get('/auth/parents');
            setParents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/students/${editingId}`, formData);
            } else {
                await axios.post('/students', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: '' });
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save student');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student completely from the database?')) return;
        try {
            await axios.delete(`/students/${id}`);
            setIsModalOpen(false);
            setEditingId(null);
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete student');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
                {user?.role === 'Admin' && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        <span>Add Student</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Enrollment No</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Linked Parent</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">No students found. Add one to get started.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4">{student.enrollmentNo || 'N/A'}</td>
                                    <td className="p-4 font-medium text-gray-800">{student.userId?.name || 'Unknown'}</td>
                                    <td className="p-4 text-gray-500">{student.userId?.email || 'N/A'}</td>
                                    <td className="p-4">
                                        {student.parentId ? (
                                            <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded max-w-min whitespace-nowrap text-xs font-bold">
                                                <LinkIcon size={12} />
                                                <span>{student.parentId.name}</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Not Linked</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => {
                                                setEditingId(student._id);
                                                setFormData({
                                                    name: student.userId?.name || '',
                                                    email: student.userId?.email || '',
                                                    password: '', // Optional for edit
                                                    phone: student.userId?.phone || '',
                                                    enrollmentNo: student.enrollmentNo || '',
                                                    parentId: student.parentId?._id || ''
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', email: '', password: '', phone: '', enrollmentNo: '', parentId: '' }); }} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingId ? 'New Password (Optional)' : 'Temporary Password'}
                                </label>
                                <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment No (Unique)</label>
                                <input type="text" required value={formData.enrollmentNo} onChange={e => setFormData({ ...formData, enrollmentNo: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Link Parent Account (Optional)</label>
                                <select
                                    value={formData.parentId}
                                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                >
                                    <option value="">-- No Parent Linked --</option>
                                    {parents.map(parent => (
                                        <option key={parent._id} value={parent._id}>
                                            {parent.name} ({parent.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Linking allows the parent to see this student's progress.</p>
                            </div>

                            <div className="flex space-x-3 pt-2">
                                {editingId && user?.role === 'Admin' && (
                                    <button type="button" onClick={() => handleDelete(editingId)} className="bg-red-100 text-red-600 p-2.5 rounded-lg font-bold hover:bg-red-200 flex items-center justify-center aspect-square" title="Delete Student">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button type="submit" className="flex-1 bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
