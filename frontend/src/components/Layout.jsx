import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex bg-background min-h-screen text-gray-100 font-sans selection:bg-accent/30 selection:text-highlight">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-highlight/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                {/* Mobile Header */}
                <header className="md:hidden glass border-b border-white/5 p-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="ml-2 font-bold text-xl gradient-text">CoachingPro</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="p-4 md:p-8 min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Layout;
