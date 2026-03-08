import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const Batches = () => {
    const [batches, setBatches] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' });

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
    }, []);

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/batches');
            setBatches(data);
        } catch (error) {
            console.error(error);
        }
    };

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
            if (editingId) {
                await axios.put(`/batches/${editingId}`, formData);
            } else {
                await axios.post('/batches', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' });
            fetchBatches();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save batch');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Batches Management</h1>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    <span>Create Batch</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                        No batches found. Create one to get started.
                    </div>
                ) : (
                    batches.map((batch) => (
                        <div key={batch._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{batch.name}</h3>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{batch.subject}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">Instructor:</span> {batch.teacherId?.name || 'Unassigned'}</p>
                            <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">Timing:</span> {batch.timing}</p>
                            <p className="text-gray-600 text-sm"><span className="font-semibold">Fee:</span> ₹{batch.monthlyFee}/mo</p>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => {
                                        setEditingId(batch._id);
                                        setFormData({
                                            name: batch.name || '',
                                            teacherId: batch.teacherId?._id || '',
                                            timing: batch.timing || '',
                                            subject: batch.subject || '',
                                            monthlyFee: batch.monthlyFee || ''
                                        });
                                        setIsModalOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Manage Batch
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Batch' : 'Create New Batch'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', teacherId: '', timing: '', subject: '', monthlyFee: '' }); }} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g. Class 10 Physics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher</label>
                                <select required value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="">Select a Teacher</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g. Mathematics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
                                <input type="text" required value={formData.timing} onChange={e => setFormData({ ...formData, timing: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g. MWF 4PM - 6PM" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (₹)</label>
                                <input type="number" required value={formData.monthlyFee} onChange={e => setFormData({ ...formData, monthlyFee: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700">
                                {editingId ? 'Save Changes' : 'Create Batch'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Batches;
