import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiLockClosed, HiMail, HiEye, HiEyeOff } from 'react-icons/hi';
import { resetPasswordThunk, clearError, clearResetPasswordState } from '../../features/authSlice';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token') || '';
    const emailFromUrl = searchParams.get('email') || '';

    const [formData, setFormData] = useState({
        email: emailFromUrl,
        token: tokenFromUrl,
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { resetPasswordLoading, resetPasswordSuccess, error } = useSelector((s) => s.auth);

    useEffect(() => {
        return () => {
            dispatch(clearResetPasswordState());
            dispatch(clearError());
        };
    }, [dispatch]);

    useEffect(() => {
        if (resetPasswordSuccess) {
            toast.success('Password reset successfully! 🎉');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [resetPasswordSuccess, navigate]);

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(formData.newPassword))
            newErrors.newPassword = 'Password must have uppercase, lowercase, number and special character';
        if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // swagger2: ResetPasswordDto { email, token, newPassword, confirmPassword }
        await dispatch(resetPasswordThunk({
            email: formData.email,
            token: formData.token,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
        }));
    };

    const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all`;

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
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h1>
                    <p className="text-text-secondary text-sm">Enter your new password below</p>
                </div>

                <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-border p-8">
                    {resetPasswordSuccess ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Password Reset!</h3>
                            <p className="text-sm text-text-secondary">Redirecting to login...</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</motion.div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                                <div className="relative">
                                    <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input id="reset-email" type="email" value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com" className={inputClass} />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
                                <div className="relative">
                                    <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input id="reset-password" type={showPassword ? 'text' : 'password'} value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="Min. 8 chars, uppercase, number, symbol" className={`${inputClass} pr-11`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-secondary">
                                        {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input id="reset-confirm" type="password" value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Confirm your new password" className={inputClass} />
                                </div>
                                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <button id="reset-submit" type="submit" disabled={resetPasswordLoading}
                                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {resetPasswordLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Resetting...
                                    </span>
                                ) : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <p className="mt-6 text-center text-sm text-text-secondary">
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">← Back to Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
