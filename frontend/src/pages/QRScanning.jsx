import { useState, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

const QRScanning = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [message, setMessage] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);

    // Store reference to scanner instance for cleanup
    const scannerRef = useRef(null);

    useEffect(() => {
        axios.get('/batches').then(res => setBatches(res.data));
        return () => stopScanner();
    }, []);

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
            setScannerActive(false);
        }
    };

    const startScanner = () => {
        if (!selectedBatch) {
            setMessage({ type: 'error', text: 'Please select a batch first.' });
            return;
        }

        setScannerActive(true);
        setMessage(null);

        // Needs to trigger on next DOM tick after div shows up
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scannerRef.current = scanner;

            scanner.render(async (decodedText) => {
                // Throttle/pause scanner after success usually, but for continuous, just handle API
                try {
                    // Expect decoupled JSON e.g. { "s": "studentId_value" }
                    const data = JSON.parse(decodedText);
                    const stuId = data.s || decodedText; // fallback if it's raw ID

                    const res = await axios.post('/attendance/scan', {
                        studentId: stuId,
                        batchId: selectedBatch
                    });

                    setMessage({ type: 'success', text: `Success: ${res.data.message}` });
                    // Optional beep sound here
                } catch (err) {
                    setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid QR or network error.' });
                }
            }, (error) => {
                // Ignore ongoing scan errors which happen constantly when no QR is found
            });
        }, 100);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 text-center">QR Attendance Scanner</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Active Batch Class</label>
                <select
                    value={selectedBatch}
                    onChange={(e) => { setSelectedBatch(e.target.value); stopScanner(); }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg mb-6"
                >
                    <option value="">-- Choose Batch --</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.subject}</option>)}
                </select>

                {!scannerActive ? (
                    <button
                        onClick={startScanner}
                        className="w-full bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition font-bold"
                    >
                        <Camera size={24} />
                        <span>Start Camera Scanner</span>
                    </button>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 relative">
                        {/* CSS to hide the 'Powered By' external link from html5-qrcode */}
                        <style>{`
                            #reader a { display: none !important; }
                            #reader span a { display: none !important; }
                        `}</style>
                        <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
                        <button
                            onClick={stopScanner}
                            className="mt-4 w-full bg-red-100 text-red-600 p-3 rounded-lg font-semibold hover:bg-red-200"
                        >
                            Stop Scanner
                        </button>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-lg font-medium shadow-sm transition-all animate-bounce ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    <AlertCircle size={24} />
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
};

export default QRScanning;
