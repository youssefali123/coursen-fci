import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { registerUser, clearError } from '../../features/authSlice';
import toast from 'react-hot-toast';

// UserRole enum: 0=Student, 1=Instructor, 2=Admin
// Gender enum: 0=Male, 1=Female
const ROLE_MAP = { student: 0, instructor: 1 };
const GENDER_MAP = { male: 0, female: 1 };

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        gender: 'male',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { loading, error: apiError } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        dispatch(clearError());
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) newErrors.name = 'Name can only contain letters, numbers and underscores';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(formData.password))
            newErrors.password = 'Password must have uppercase, lowercase, number and special character';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const roleValue = ROLE_MAP[formData.role];
        const genderValue = GENDER_MAP[formData.gender];

        // swagger2: RegisterDto is application/json with fields: name, email, password, role, gender
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: roleValue,
            gender: genderValue,
        };

        const result = await dispatch(registerUser(payload));

        if (registerUser.fulfilled.match(result)) {
            toast.success('Account created successfully! 🎉');
            if (result.payload) {
                navigate(formData.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard');
            } else {
                toast('Please sign in with your new account.', { icon: '👋' });
                navigate('/login');
            }
        } else {
            toast.error(result.payload || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="text-2xl font-bold gradient-text">EduFlow</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Create Account</h1>
                    <p className="text-text-secondary text-sm">Join thousands of learners worldwide</p>
                </div>

                {/* Form Card */}
                <div className="bg-card rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-border p-8">
                    {/* Role Selection */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-text-secondary mb-3">I want to...</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                id="role-student"
                                onClick={() => setFormData((prev) => ({ ...prev, role: 'student' }))}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${formData.role === 'student'
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-border text-text-secondary hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">👨‍🎓</span>
                                <span className="text-sm font-semibold">Learn</span>
                            </button>
                            <button
                                type="button"
                                id="role-instructor"
                                onClick={() => setFormData((prev) => ({ ...prev, role: 'instructor' }))}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${formData.role === 'instructor'
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-border text-text-secondary hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">👨‍🏫</span>
                                <span className="text-sm font-semibold">Teach</span>
                            </button>
                        </div>
                    </div>

                    {/* Gender Selection */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-text-secondary mb-3">Gender</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleChange}
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-text-secondary">Male</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleChange}
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-text-secondary">Female</span>
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
                            >
                                {apiError}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Username</label>
                            <div className="relative">
                                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="register-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="JohnDoe123"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.name ? 'border-red-300' : 'border-border'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all`}
                                    autoComplete="username"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                            <div className="relative">
                                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="register-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-300' : 'border-border'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all`}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
                            <div className="relative">
                                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 chars, uppercase, number, symbol"
                                    className={`w-full pl-11 pr-11 py-3 rounded-xl border ${errors.password ? 'border-red-300' : 'border-border'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all`}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-secondary"
                                >
                                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="register-confirm-password"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-300' : 'border-border'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all`}
                                    autoComplete="new-password"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
