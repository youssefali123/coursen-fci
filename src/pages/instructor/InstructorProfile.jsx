import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUpload, HiSave, HiBookOpen, HiStar, HiUsers, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { fetchInstructorDashboard } from '../../features/instructorSlice';
import { changePassword } from '../../features/authSlice';
import * as instructorApi from '../../features/instructor/instructor.api';
import toast from 'react-hot-toast';

const InstructorProfile = () => {
    const { user } = useSelector((s) => s.auth);
    const { dashboard } = useSelector((s) => s.instructor);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({ bio: '', specialization: '', linkedInUrl: '', gitHubUrl: '', websiteUrl: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showPassSection, setShowPassSection] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => { dispatch(fetchInstructorDashboard()); }, [dispatch]);

    useEffect(() => {
        if (user) {
            setFormData({
                bio: user.bio || '',
                specialization: user.specialization || '',
                linkedInUrl: user.linkedInUrl || '',
                gitHubUrl: user.gitHubUrl || '',
                websiteUrl: user.websiteUrl || '',
            });
        }
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            if (avatarFile) fd.append('Image', avatarFile);
            if (formData.bio) fd.append('Bio', formData.bio);
            if (formData.specialization) fd.append('Specialization', formData.specialization);
            if (formData.linkedInUrl) fd.append('LinkedInUrl', formData.linkedInUrl);
            if (formData.gitHubUrl) fd.append('GitHubUrl', formData.gitHubUrl);
            if (formData.websiteUrl) fd.append('WebsiteUrl', formData.websiteUrl);
            await instructorApi.editProfile(fd);
            toast.success('Profile updated successfully! ✨');
            setAvatarFile(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passData.currentPassword || !passData.newPassword) { toast.error('All fields are required'); return; }
        if (passData.newPassword !== passData.confirm) { toast.error('New passwords do not match'); return; }
        if (passData.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setPassLoading(true);
        const result = await dispatch(changePassword({ currentPassword: passData.currentPassword, newPassword: passData.newPassword }));
        setPassLoading(false);
        if (changePassword.fulfilled.match(result)) {
            toast.success('Password changed successfully! 🔐');
            setPassData({ currentPassword: '', newPassword: '', confirm: '' });
            setShowPassSection(false);
        } else {
            toast.error(result.payload || 'Failed to change password');
        }
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-transparent';
    const avatarSrc = avatarPreview || user?.pathOfImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`;

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">My <span className="gradient-text">Profile</span></h1>
                <p className="text-text-secondary text-sm mt-1">Manage your instructor profile and settings</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { icon: HiBookOpen, label: 'Courses', value: dashboard?.totalCourses ?? '—', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                    { icon: HiUsers, label: 'Students', value: dashboard?.totalStudents ?? '—', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { icon: HiStar, label: 'Avg Rating', value: dashboard?.averageRating ? Number(dashboard.averageRating).toFixed(1) : '—', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className={`flex items-center gap-3 p-4 rounded-2xl border border-border ${bg}`}>
                        <Icon className={`w-6 h-6 ${color} shrink-0`} />
                        <div>
                            <p className={`text-lg font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-text-secondary">{label}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-primary-600 to-purple-600" />

                <div className="px-6 pb-6">
                    {/* Avatar */}
                    <div className="-mt-12 mb-4 flex items-end justify-between">
                        <div className="relative group w-24 h-24">
                            <img src={avatarSrc} alt={user?.name} className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-gray-900 object-cover bg-card shadow-xl" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <HiUpload className="w-6 h-6 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                            {avatarFile && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />}
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-text-primary">{user?.name}</p>
                            <p className="text-sm text-text-secondary">{user?.email}</p>
                            <span className="inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700">Instructor</span>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
                            <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3}
                                placeholder="Tell students about your experience and expertise..."
                                className={inputClass + ' resize-none'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Specialization</label>
                            <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                placeholder="e.g. Full Stack Development, Data Science..." className={inputClass} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">LinkedIn URL</label>
                                <input type="url" value={formData.linkedInUrl} onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                                    placeholder="https://linkedin.com/in/..." className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">GitHub URL</label>
                                <input type="url" value={formData.gitHubUrl} onChange={(e) => setFormData({ ...formData, gitHubUrl: e.target.value })}
                                    placeholder="https://github.com/..." className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Website / Portfolio</label>
                            <input type="url" value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                placeholder="https://yourwebsite.com" className={inputClass} />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button onClick={handleSaveProfile} disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60">
                                {saving ? (
                                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                                ) : (
                                    <><HiSave className="w-4 h-4" />Save Profile</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Change Password */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowPassSection(!showPassSection)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <HiLockClosed className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text-primary">Change Password</p>
                            <p className="text-xs text-text-secondary">Update your account security</p>
                        </div>
                    </div>
                    <motion.span animate={{ rotate: showPassSection ? 180 : 0 }} className="text-gray-400 text-xs">▼</motion.span>
                </button>

                <AnimatePresence>
                    {showPassSection && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <form onSubmit={handleChangePassword} className="px-6 pb-6 space-y-4 border-t border-border pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                                    <div className="relative">
                                        <input type={showPasswords.current ? 'text' : 'password'} value={passData.currentPassword}
                                            onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                                            className={inputClass + ' pr-11'} placeholder="Your current password" required />
                                        <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-secondary">
                                            {showPasswords.current ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                                    <div className="relative">
                                        <input type={showPasswords.new ? 'text' : 'password'} value={passData.newPassword}
                                            onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                            className={inputClass + ' pr-11'} placeholder="Min 8 chars, uppercase, number, symbol" required />
                                        <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-secondary">
                                            {showPasswords.new ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                                    <input type="password" value={passData.confirm}
                                        onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                        className={inputClass} placeholder="Repeat your new password" required />
                                </div>
                                <button type="submit" disabled={passLoading}
                                    className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center gap-2">
                                    {passLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating...</>) : '🔐 Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default InstructorProfile;
