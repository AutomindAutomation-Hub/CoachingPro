import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const { data } = await axios.get('/teachers');
            setTeachers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/teachers', formData);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', phone: '' });
            fetchTeachers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add teacher');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Teachers Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    <span>Add Teacher</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Phone</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">No teachers found. Add one to get started.</td>
                            </tr>
                        ) : (
                            teachers.map((teacher) => (
                                <tr key={teacher._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{teacher.name}</td>
                                    <td className="p-4 text-gray-500">{teacher.email}</td>
                                    <td className="p-4 text-gray-500">{teacher.phone || 'N/A'}</td>
                                    <td className="p-4">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
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
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Add New Teacher</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teachers;
