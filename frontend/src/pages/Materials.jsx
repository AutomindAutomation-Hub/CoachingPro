import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { FileUp, Download, Trash2, FileText } from 'lucide-react';

const Materials = () => {
    const { user } = useAuthStore();
    const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin';
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [materials, setMaterials] = useState([]);

    // Upload state
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        axios.get('/batches').then(res => {
            setBatches(res.data);
            if (res.data.length > 0) {
                setSelectedBatch(res.data[0]._id);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedBatch) return;
        fetchMaterials();
    }, [selectedBatch]);

    const fetchMaterials = async () => {
        try {
            const { data } = await axios.get(`/materials/${selectedBatch}`);
            setMaterials(data);
        } catch (error) {
            console.error('Fetch err', error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title || !selectedBatch) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', title);
        formData.append('batchId', selectedBatch);

        setUploading(true);
        try {
            await axios.post('/materials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTitle('');
            setFile(null);
            fetchMaterials();
        } catch (err) {
            console.error('Upload err', err);
            alert('Failed to upload file');
        }
        setUploading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            await axios.delete(`/materials/${id}`);
            fetchMaterials();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course / Batch</label>
                <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg text-gray-800"
                >
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.subject}</option>)}
                </select>
            </div>

            {isTeacher && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FileUp className="mr-2" /> Upload New Material</h2>
                    <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                                placeholder="e.g. Chapter 4 - Thermodynamics Notes"
                                required
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, Image)</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Notes</h2>
                {materials.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                        No materials found for this batch.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map(mat => (
                            <div key={mat._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between group hover:shadow-md transition">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={24} />
                                        </div>
                                        {isTeacher && (
                                            <button onClick={() => handleDelete(mat._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{mat.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">Uploaded by {mat.uploadedBy?.name || 'Unknown'}</p>
                                </div>
                                <a
                                    href={`http://localhost:5000${mat.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-row items-center justify-center space-x-2 w-full py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-lg font-medium transition"
                                >
                                    <Download size={18} />
                                    <span>Download</span>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Materials;
