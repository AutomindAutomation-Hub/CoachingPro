import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TermIcon, Cpu, Database, Globe, Command, X, ShieldAlert, Cpu as CpuIcon, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terminal = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([
        { type: 'sys', content: 'INITIALIZING COACHINGPRO CORE v4.0.2...' },
        { type: 'sys', content: 'ESTABLISHING SECURE TUNNEL TO NODE-B64...' },
        { type: 'sys', content: 'AUTHENTICATION_SUCCESS [ROOT_PRIVILEGES_GRANTED]' },
        { type: 'input', content: 'Welcome amrit. Type "help" for a list of operational commands.' },
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [history]);

    const handleCommand = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim().toLowerCase();
        const newHistory = [...history, { type: 'user', content: `admin@coachingpro:~$ ${input}` }];

        switch (cmd) {
            case 'help':
                newHistory.push({ type: 'res', content: 'Available Commands:\n- fetch-logs: Stream recent cluster activity\n- sys-stat: Real-time telemetry dump\n- db-sync: Force re-synchronize all database shards\n- cls: Clear terminal workspace\n- whoami: Active session metadata\n- exit: Terminate shell session' });
                break;
            case 'sys-stat':
                newHistory.push({ type: 'res', content: 'CPU: [||||||||||] 24% | MEM: [||||||] 1.2GB/16GB | NET: 142ms [LATENCY]' });
                break;
            case 'fetch-logs':
                newHistory.push({ type: 'sys', content: '[INFO] 20:09:42 User "Shreya" established socket connection.' });
                newHistory.push({ type: 'sys', content: '[SUCCESS] 20:10:05 Attendance cluster for "Class 10" synchronized.' });
                newHistory.push({ type: 'sys', content: '[WARNING] 20:11:12 Unusual latency detected in DB_SHARD_3.' });
                break;
            case 'db-sync':
                newHistory.push({ type: 'sys', content: 'LOCKING DATABASE SHARDS...' });
                newHistory.push({ type: 'sys', content: 'MIGRATING BUFFERED LOGS...' });
                newHistory.push({ type: 'res', content: 'SYNC_COMPLETE: All clusters are now in parity.' });
                break;
            case 'cls':
                setHistory([]);
                setInput('');
                return;
            case 'whoami':
                newHistory.push({ type: 'res', content: 'USER: amrit | ROLE: Administrator | PERMS: [FULL_ROOT_OVERWRITE] | IP: 192.168.1.104' });
                break;
            case 'exit':
                navigate('/');
                return;
            default:
                newHistory.push({ type: 'err', content: `COMMAND_NOT_FOUND: "${cmd}". Re-verify syntax protocol.` });
        }

        setHistory(newHistory);
        setInput('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] bg-black p-4 flex items-center justify-center font-mono"
        >
            <div className="w-full h-full max-w-6xl flex flex-col glass-card border-none bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]">
                {/* Terminal Header */}
                <div className="bg-white/5 border-b border-white/5 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500 opacity-50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500 opacity-50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-50" />
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <div className="flex items-center text-[10px] font-black tracking-widest text-gray-400 uppercase">
                            <TermIcon size={14} className="mr-2 text-accent" />
                            Secure Admin Shell [SESSION_ID: 11492]
                        </div>
                    </div>
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Dashboard Stats Bar */}
                <div className="grid grid-cols-4 border-b border-white/5 bg-white/[0.02]">
                    {[
                        { label: 'Latency', val: '142ms', icon: Globe, color: 'text-emerald-400' },
                        { label: 'Active Sockets', val: '14', icon: History, color: 'text-amber-400' },
                        { label: 'Entropy', val: '4.2%', icon: ShieldAlert, color: 'text-rose-400' },
                        { label: 'Compute', val: '24%', icon: CpuIcon, color: 'text-highlight' }
                    ].map((s, i) => (
                        <div key={i} className="px-8 py-4 border-r border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                <s.icon size={12} />
                                <span>{s.label}</span>
                            </div>
                            <span className={`text-[10px] font-black ${s.color}`}>{s.val}</span>
                        </div>
                    ))}
                </div>

                {/* Terminal Output */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-2 text-sm md:text-base scroll-smooth custom-scrollbar"
                >
                    <AnimatePresence>
                        {history.map((line, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.1 }}
                                className={`whitespace-pre-wrap leading-relaxed ${line.type === 'sys' ? 'text-indigo-400 font-bold italic' :
                                        line.type === 'user' ? 'text-white' :
                                            line.type === 'err' ? 'text-rose-500 bg-rose-500/10 px-2 py-1' :
                                                line.type === 'res' ? 'text-highlight' :
                                                    'text-gray-400'
                                    }`}
                            >
                                {line.content}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Input Line */}
                    <form onSubmit={handleCommand} className="flex items-center pt-4">
                        <span className="text-emerald-400 font-bold mr-3 animate-pulse">admin@coachingpro:~$</span>
                        <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-white selection:bg-highlight/30"
                            autoComplete="off"
                            spellCheck="false"
                        />
                    </form>
                </div>

                {/* Footer Tip */}
                <div className="bg-white/5 p-4 text-center">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
                        CoachingPro Infrastructure Layer - Node Connectivity: OPTIMAL
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Terminal;
