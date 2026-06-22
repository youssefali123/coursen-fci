import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleSidebar } from '../../features/uiSlice';
import { logoutUser } from '../../features/authSlice';
import {
    HiHome,
    HiBookOpen,
    HiPlusCircle,
    HiChartBar,
    HiQuestionMarkCircle,
    HiUser,
    HiCog,
    HiLogout,
    HiChevronLeft,
    HiAcademicCap,
    HiClipboardList,
} from 'react-icons/hi';

const Sidebar = () => {
    const { sidebarOpen } = useSelector((state) => state.ui);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isInstructor = user?.role === 'instructor';

    const studentLinks = [
        { path: '/student/dashboard', icon: HiHome, label: 'Dashboard' },
        { path: '/student/courses', icon: HiBookOpen, label: 'My Courses' },
        { path: '/student/profile', icon: HiUser, label: 'Profile' },
    ];

    const instructorLinks = [
        { path: '/instructor/dashboard', icon: HiHome, label: 'Dashboard' },
        { path: '/instructor/courses/new', icon: HiPlusCircle, label: 'Create Course' },
        { path: '/instructor/quiz/new', icon: HiClipboardList, label: 'Quiz Builder' },
        { path: '/instructor/analytics', icon: HiChartBar, label: 'Analytics' },
        { path: '/instructor/profile', icon: HiUser, label: 'Profile' },
    ];

    const links = isInstructor ? instructorLinks : studentLinks;

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    const handleLinkClick = () => {
        if (isMobile) dispatch(toggleSidebar());
    };

    return (
        <>
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(toggleSidebar())}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                animate={{
                    width: isMobile ? 280 : (sidebarOpen ? 256 : 72),
                    x: isMobile ? (sidebarOpen ? 0 : -280) : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`fixed left-0 bg-card border-r border-border flex flex-col shadow-sm
                    ${isMobile ? 'top-0 bottom-0 z-50' : 'top-16 bottom-0 z-40'}
                `}
            >
                {/* Toggle Button (Desktop Only) */}
                {!isMobile && (
                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        className="absolute -right-3 top-6 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
                    >
                        <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
                            <HiChevronLeft className="w-4 h-4" />
                        </motion.div>
                    </button>
                )}

                {/* User Info */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user?.name}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-100 shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl ring-2 ring-primary-100 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {(user?.name || 'U')[0].toUpperCase()}
                            </div>
                        )}
                        <AnimatePresence>
                            {(sidebarOpen || isMobile) && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-sm font-semibold text-text-primary whitespace-nowrap">{user?.name}</p>
                                    <p className="text-xs text-primary-500 capitalize whitespace-nowrap">{user?.role}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25'
                                    : 'text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 hover:text-primary-700'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 shrink-0" />
                            <AnimatePresence>
                                {(sidebarOpen || isMobile) && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {link.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}

                    <div className="pt-4 mt-4 border-t border-border">
                        <NavLink
                            to="/courses"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 hover:text-primary-700 transition-all"
                        >
                            <HiAcademicCap className="w-5 h-5 shrink-0" />
                            <AnimatePresence>
                                {(sidebarOpen || isMobile) && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        Browse Courses
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
                    >
                        <HiLogout className="w-5 h-5 shrink-0" />
                        <AnimatePresence>
                            {(sidebarOpen || isMobile) && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="whitespace-nowrap"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;

