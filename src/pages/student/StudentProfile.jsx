import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCamera, HiPencil, HiBookOpen, HiCalendar, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { updateProfile, changePassword } from '../../features/authSlice';
import { fetchStudentProfile } from '../../features/studentSlice';
import * as studentsApi from '../../features/students/students.api';
import toast from 'react-hot-toast';

const StudentProfile = () => {
    const { user } = useSelector((s) => s.auth);
    const { profile, loading } = useSelector((s) => s.student);
    const { enrolledCourses } = useSelector((s) => s.courses);
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(false);
    const [showPassSection, setShowPassSection] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
    const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => { dispatch(fetchStudentProfile()); }, [dispatch]);

    useEffect(() => {
        const src = profile || user;
        if (src) {
            setFormData({ name: src.name || '', email: src.email || '', bio: src.bio || '' });
            // Sync image from database profile to auth user state for consistent navbar avatar
            if (profile?.pathOfImage && user && profile.pathOfImage !== user.avatar) {
                dispatch(updateProfile({ avatar: profile.pathOfImage }));
            }
        }
    }, [profile, user, dispatch]);

    const handleSave = async () => {
        const toastId = toast.loading('Saving profile... ⏳');
        try {
            const queryParams = {
                Name: formData.name,
                Email: formData.email,
                Bio: formData.bio,
                Gender: displayUser?.gender ?? 0,
            };
            const fd = new FormData();

            const res = await studentsApi.editProfile(queryParams, fd);
            const updatedProfile = res.data;

            // Sync auth slice state immediately
            dispatch(updateProfile({
                name: formData.name,
                email: formData.email,
                bio: formData.bio,
                ...(updatedProfile?.pathOfImage ? { avatar: updatedProfile.pathOfImage } : {})
            }));

            // Fetch fresh database profile
            dispatch(fetchStudentProfile());

            setEditing(false);
            toast.success('Profile updated successfully! ✨', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile', { id: toastId });
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading('Uploading avatar... ⏳');
        try {
            const queryParams = {
                Name: formData.name || displayUser?.name || '',
                Email: formData.email || displayUser?.email || '',
                Bio: formData.bio || displayUser?.bio || '',
                Gender: displayUser?.gender ?? 0,
            };
            const fd = new FormData();
            fd.append('Image', file);

            const res = await studentsApi.editProfile(queryParams, fd);
            const updatedProfile = res.data;

            // Fetch fresh database profile to get new image URL
            dispatch(fetchStudentProfile());

            // Update auth state immediately if returned
            if (updatedProfile?.pathOfImage) {
                dispatch(updateProfile({ avatar: updatedProfile.pathOfImage }));
            }

            toast.success('Avatar updated successfully! ✨', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload avatar', { id: toastId });
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

    const displayUser = { ...(profile || {}), ...user };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm';

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">My <span className="gradient-text">Profile</span></h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mb-6">
                <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-6">
                        <div className="relative">
                            <img src={displayUser?.avatar || displayUser?.pathOfImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser?.name}`} alt={displayUser?.name} className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-xl bg-card object-cover" />
                            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors cursor-pointer">
                                <HiCamera className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-16 px-6 pb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">{displayUser?.name}</h2>
                            <p className="text-sm text-text-secondary">{displayUser?.email}</p>
                            <span className="inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 capitalize">{displayUser?.role || 'student'}</span>
                        </div>
                        <button onClick={() => setEditing(!editing)}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface transition-colors">
                            <HiPencil className="w-4 h-4" />{editing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {editing ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
                                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3}
                                    className={inputClass + ' resize-none'} /></div>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">Save Changes</button>
                        </motion.div>
                    ) : (
                        <div className="mt-6">
                            <p className="text-sm text-text-secondary leading-relaxed">{displayUser?.bio || 'No bio yet.'}</p>
                            <div className="flex items-center gap-6 mt-4 text-sm text-text-secondary">
                                <span className="flex items-center gap-1"><HiBookOpen className="w-4 h-4" />{enrolledCourses.length} courses</span>
                                <span className="flex items-center gap-1"><HiCalendar className="w-4 h-4" />Joined {displayUser?.joinDate || '—'}</span>
                            </div>
                        </div>
                    )}
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

export default StudentProfile;


