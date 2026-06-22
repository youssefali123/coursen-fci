import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiMail, HiArrowLeft } from 'react-icons/hi';
import { forgotPasswordThunk, clearError, clearForgotPasswordState } from '../../features/authSlice';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { forgotPasswordLoading, forgotPasswordSuccess, error } = useSelector((s) => s.auth);

    useEffect(() => {
        return () => {
            dispatch(clearForgotPasswordState());
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) { toast.error('Please enter your email'); return; }
        const result = await dispatch(forgotPasswordThunk({ email }));
        if (forgotPasswordThunk.fulfilled.match(result)) {
            toast.success('Reset link sent to your email! 📧');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="text-2xl font-bold gradient-text">EduFlow</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Forgot Password</h1>
                    <p className="text-text-secondary text-sm">Enter your email and we'll send you a reset link</p>
                </div>

                <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-border p-8">
                    {forgotPasswordSuccess ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✉️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Check Your Email</h3>
                            <p className="text-sm text-text-secondary mb-6">We've sent a password reset link to <strong>{email}</strong></p>
                            <Link to="/login" className="text-sm text-primary-600 font-semibold hover:text-primary-700">← Back to Login</Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                    {error}
                                </motion.div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
                                <div className="relative">
                                    <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                                        autoComplete="email" />
                                </div>
                            </div>
                            <button id="forgot-submit" type="submit" disabled={forgotPasswordLoading}
                                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {forgotPasswordLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Sending...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-text-secondary hover:text-primary-600 inline-flex items-center gap-1">
                            <HiArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
