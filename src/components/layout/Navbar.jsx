import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiSearch, HiBell, HiChevronDown, HiMoon, HiSun } from 'react-icons/hi';
import { logoutUser } from '../../features/authSlice';
import { toggleTheme } from '../../features/uiSlice';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.ui);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/courses', label: 'Courses' },
    ];

    const handleLogout = async () => {
        setProfileDropdown(false);
        await dispatch(logoutUser());
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        return user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">Coursen</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.path)
                                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700'
                                    : 'text-text-secondary hover:text-primary-600 hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 transition-all"
                        >
                            <HiSearch className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 transition-all"
                        >
                            {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                        </button>

                        {isAuthenticated && user ? (
                            <>
                                {/* Notifications */}
                                <button className="p-2 rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 transition-all relative">
                                    <HiBell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileDropdown(!profileDropdown)}
                                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 transition-all"
                                    >
                                        {user.avatar ? (
                                             <img
                                                 src={user.avatar}
                                                 alt={user.name}
                                                 className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-200"
                                             />
                                         ) : (
                                             <div className="w-8 h-8 rounded-lg ring-2 ring-primary-200 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                                 {(user.name || 'U')[0].toUpperCase()}
                                             </div>
                                         )}
                                        <span className="hidden sm:block text-sm font-medium text-text-secondary">{user.name}</span>
                                        <HiChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>

                                    <AnimatePresence>
                                        {profileDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border py-2 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-border">
                                                    <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                                                    <p className="text-xs text-text-secondary">{user.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 capitalize">
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <Link
                                                    to={getDashboardLink()}
                                                    onClick={() => setProfileDropdown(false)}
                                                    className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 hover:text-primary-700 transition-colors"
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/student/profile"
                                                    onClick={() => setProfileDropdown(false)}
                                                    className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 hover:text-primary-700 transition-colors"
                                                >
                                                    My Profile
                                                </Link>
                                                <hr className="my-1 border-border" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Link
                                    to="/login"
                                    className="px-3 sm:px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30"
                        >
                            {mobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden bg-surface dark:bg-card shadow-lg"
                    >
                        <div className="max-w-2xl mx-auto px-4 py-3">
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search courses, topics, instructors..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigate(`/courses?search=${e.target.value}`);
                                            setSearchOpen(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-border overflow-hidden bg-surface dark:bg-card shadow-lg"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive(link.path)
                                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700'
                                        : 'text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated && (
                                <Link
                                    to={getDashboardLink()}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30"
                                >
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

