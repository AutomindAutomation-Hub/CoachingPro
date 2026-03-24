import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw, Layers, ScanLine, XCircle, ShieldCheck, Zap, Upload, QrCode, ClipboardList, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const QRScanning = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);
    const [activeTab, setActiveTab] = useState('scan'); // 'scan', 'upload', 'generate'

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

    const handleScanSuccess = async (decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            const stuId = data.s || decodedText;

            const res = await axios.post('/attendance/scan', {
                studentId: stuId,
                batchId: selectedBatch,
                notes: notes // include notes if any
            });

            setMessage({ type: 'success', text: `Success: ${res.data.message}` });
            if (activeTab === 'scan') stopScanner();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid QR or network error.' });
        }
    };

    const startScanner = () => {
        if (!selectedBatch) {
            setMessage({ type: 'error', text: 'Please select a batch first.' });
            return;
        }

        setScannerActive(true);
        setMessage(null);

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 20, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scannerRef.current = scanner;
            scanner.render(handleScanSuccess, (error) => { });
        }, 100);
    };

    const handleFileUpload = async (e) => {
        if (!selectedBatch) {
            setMessage({ type: 'error', text: 'Please select a batch first.' });
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        const html5QrCode = new Html5Qrcode("reader-hidden");
        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            handleScanSuccess(decodedText);
        } catch (err) {
            setMessage({ type: 'error', text: 'Could not detect QR code in image.' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 max-w-2xl mx-auto pb-20"
        >
            <div className="text-center">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="inline-block p-4 bg-accent/20 rounded-[2rem] border border-accent/20 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                >
                    <ScanLine size={48} className="text-accent" />
                </motion.div>
                <h1 className="text-4xl font-black tracking-tighter text-white">QR Access <span className="gradient-text">Terminal</span></h1>
                <p className="text-gray-400 font-medium mt-2 uppercase tracking-widest text-[10px]">Biometric synchronization protocol active</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-white/5 rounded-[2.5rem] border border-white/10 gap-2">
                {[
                    { id: 'scan', label: 'Live Nexus', icon: Camera },
                    { id: 'upload', label: 'Data Import', icon: Upload },
                    { id: 'generate', label: 'Code Gen', icon: QrCode },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); stopScanner(); setMessage(null); }}
                        className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <motion.div
                className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-4xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-highlight to-accent animate-gradient-x" />

                <div className="space-y-8">
                    {/* Common config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operations Node</label>
                            <div className="relative">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => { setSelectedBatch(e.target.value); stopScanner(); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-accent appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-surface italic">-- Choose Batch --</option>
                                    {batches.map(b => <option key={b._id} value={b._id} className="bg-surface">{b.name} - {b.subject}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operation Notes</label>
                            <div className="relative">
                                <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-highlight" size={20} />
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Morning Session"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold focus:outline-none focus:border-highlight"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <AnimatePresence mode="wait">
                            {activeTab === 'scan' && (
                                <motion.div
                                    key="scan-tab"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                >
                                    {!scannerActive ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(99,102,241,0.3)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={startScanner}
                                            className="w-full bg-accent text-white p-6 rounded-[2rem] flex items-center justify-center space-x-3 font-black text-sm tracking-[0.2em] uppercase transition-all"
                                        >
                                            <Camera size={24} strokeWidth={3} />
                                            <span>Initialize Lens</span>
                                        </motion.button>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] p-4 relative group overflow-hidden">
                                                <style>{`
                                                    #reader a { display: none !important; }
                                                    #reader video { border-radius: 1.5rem !important; }
                                                `}</style>
                                                <div id="reader" className="w-full overflow-hidden rounded-3xl"></div>
                                                <button
                                                    onClick={stopScanner}
                                                    className="mt-6 w-full bg-red-500/10 text-red-400 p-4 rounded-2xl font-black text-xs tracking-widest uppercase border border-red-500/20 flex items-center justify-center space-x-2"
                                                >
                                                    <XCircle size={18} />
                                                    <span>Terminate System</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'upload' && (
                                <motion.div
                                    key="upload-tab"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                >
                                    <div className="py-12 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center group hover:border-accent/30 transition-all cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Upload size={48} className="text-gray-600 mb-4 group-hover:text-accent transition-colors" />
                                        <p className="text-lg font-black text-gray-400 uppercase tracking-tighter">Drop Identity Code</p>
                                        <p className="text-xs font-bold text-gray-600 mt-2 uppercase tracking-widest">or click to browse local matrix</p>
                                    </div>
                                    <div id="reader-hidden" className="hidden"></div>
                                </motion.div>
                            )}

                            {activeTab === 'generate' && (
                                <motion.div
                                    key="generate-tab"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center space-y-8"
                                >
                                    {!selectedBatch ? (
                                        <div className="py-10 text-center opacity-20">
                                            <QrCode size={64} className="mx-auto mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest">Node Unselected</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-highlight">
                                                <QRCodeSVG
                                                    value={JSON.stringify({ b: selectedBatch, t: Date.now(), n: notes })}
                                                    size={200}
                                                />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <p className="text-xl font-black text-white uppercase tracking-tight">Batch identity Token</p>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{batches.find(b => b._id === selectedBatch)?.name}</p>
                                            </div>
                                            <button
                                                onClick={() => window.print()}
                                                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all"
                                            >
                                                <Download size={18} />
                                                <span>Print Token</span>
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={`p-6 rounded-[2.5rem] flex items-center justify-between border-2 shadow-2xl backdrop-blur-xl ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-2xl ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                {message.type === 'success' ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">{message.type === 'success' ? 'Verified' : 'Error Detected'}</p>
                                <p className="text-lg font-black tracking-tight leading-none">{message.text}</p>
                            </div>
                        </div>
                        {message.type === 'success' && <Zap size={24} className="animate-pulse text-highlight mr-4" />}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default QRScanning;
