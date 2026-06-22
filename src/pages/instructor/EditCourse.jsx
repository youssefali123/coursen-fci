import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiArrowLeft,
    HiTrash,
    HiSave,
    HiUpload,
    HiPlus,
    HiDocumentText,
    HiPencil,
    HiFolder,
    HiChevronDown,
    HiChevronUp,
    HiPlay,
    HiPhotograph
} from 'react-icons/hi';
import { updateCourseThunk, deleteCourseThunk, fetchCourseById, fetchSectionsWithLessons } from '../../features/coursesSlice';
import { createSectionThunk, updateSectionThunk, deleteSectionThunk, createLessonThunk, deleteLessonThunk } from '../../features/sectionSlice';
import { fetchQuizzesByCourseThunk } from '../../features/quizSlice';
import { fetchCategories } from '../../features/categorySlice';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const LEVEL_MAP = { Beginner: 0, Intermediate: 1, Advanced: 2 };
const LEVEL_REVERSE = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' };
const FILE_TYPE_MAP = { image: 0, video: 1, pdf: 2 };

const EditCourse = () => {
    const { id } = useParams();
    const courseId = Number(id);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const course = useSelector((s) => s.courses.courses.find((c) => c.id === courseId) || s.courses.currentCourse);
    const { sections, loading: coursesLoading } = useSelector((s) => s.courses);
    const { categories } = useSelector((s) => s.category);
    const { courseQuizzes } = useSelector((s) => s.quiz);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Section Management States
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editingSectionTitle, setEditingSectionTitle] = useState('');
    const [sectionsLoading, setSectionsLoading] = useState(false);

    // Lesson Management States
    const [expandedSection, setExpandedSection] = useState(null);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [lessonForms, setLessonForms] = useState({}); // sectionId -> lessonForm data

    useEffect(() => {
        dispatch(fetchCourseById(courseId));
        dispatch(fetchSectionsWithLessons(courseId));
        dispatch(fetchQuizzesByCourseThunk(courseId));
        dispatch(fetchCategories());
    }, [dispatch, courseId]);

    const [formData, setFormData] = useState({ title: '', description: '', shortDescription: '', categoryId: '', level: 'Beginner', price: 0 });

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.longDescription || course.description || '',
                shortDescription: course.shortDescription || '',
                categoryId: course.categoryId || '',
                level: LEVEL_REVERSE[course.level] || course.level || 'Beginner',
                price: course.price || 0,
            });
        }
    }, [course]);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    if (!course) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-text-secondary">Loading course...</p>
            </div>
        );
    }

    const handleSave = async () => {
        const apiPayload = {
            title: formData.title,
            shortDescription: formData.shortDescription,
            longDescription: formData.description,
            categoryId: Number(formData.categoryId),
            level: LEVEL_MAP[formData.level] ?? 0,
            price: Number(formData.price) || 0
        };
        const result = await dispatch(updateCourseThunk({
            courseId: course.id,
            courseData: apiPayload,
            thumbnailFile: thumbnail || null
        }));
        if (updateCourseThunk.fulfilled.match(result)) {
            toast.success('Course updated! ✅');
        } else {
            toast.error(result.payload || 'Failed to update course');
        }
    };

    const handleDelete = async () => {
        const result = await dispatch(deleteCourseThunk(course.id));
        if (deleteCourseThunk.fulfilled.match(result)) {
            toast.success('Course deleted');
            navigate('/instructor/dashboard');
        } else {
            toast.error(result.payload || 'Failed to delete course');
        }
    };

    // --- SECTIONS ---
    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) {
            toast.error('Section title required');
            return;
        }
        setSectionsLoading(true);
        const result = await dispatch(createSectionThunk({
            courseId,
            title: newSectionTitle.trim(),
            order: sections.length + 1
        }));
        setSectionsLoading(false);

        if (createSectionThunk.fulfilled.match(result)) {
            toast.success('Section added! 📁');
            setNewSectionTitle('');
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to add section');
        }
    };

    const handleStartEditSection = (section) => {
        setEditingSectionId(section.id);
        setEditingSectionTitle(section.title);
    };

    const handleSaveSectionTitle = async (sectionId, originalOrder) => {
        if (!editingSectionTitle.trim()) {
            toast.error('Section title cannot be empty');
            return;
        }
        setSectionsLoading(true);
        const result = await dispatch(updateSectionThunk({
            sectionId,
            data: { title: editingSectionTitle.trim(), order: originalOrder },
        }));
        setSectionsLoading(false);

        if (updateSectionThunk.fulfilled.match(result)) {
            toast.success('Section updated!');
            setEditingSectionId(null);
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to update section');
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm('Delete this section and all its lessons?')) return;
        setSectionsLoading(true);
        const result = await dispatch(deleteSectionThunk(sectionId));
        setSectionsLoading(false);

        if (deleteSectionThunk.fulfilled.match(result)) {
            toast.success('Section deleted');
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to delete section');
        }
    };

    const handleReorderSection = async (section, direction) => {
        const index = sections.findIndex(s => s.id === section.id);
        if (index === -1) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        const targetSection = sections[targetIndex];

        setSectionsLoading(true);
        await dispatch(updateSectionThunk({
            sectionId: section.id,
            data: { title: section.title, order: targetSection.order },
        }));
        await dispatch(updateSectionThunk({
            sectionId: targetSection.id,
            data: { title: targetSection.title, order: section.order },
        }));
        setSectionsLoading(false);
        dispatch(fetchSectionsWithLessons(courseId));
    };

    // --- LESSONS ---
    const handleLessonFormChange = (sectionId, field, value) => {
        setLessonForms(prev => ({
            ...prev,
            [sectionId]: {
                ...(prev[sectionId] || { title: '', type: 'video', duration: '', order: 1, file: null }),
                [field]: value
            }
        }));
    };

    const handleAddLesson = async (sectionId) => {
        const form = lessonForms[sectionId];
        if (!form?.title?.trim()) {
            toast.error('Lesson title required');
            return;
        }
        if (!form.file) {
            toast.error('Please upload a file for the lesson');
            return;
        }

        setLessonsLoading(true);
        const fd = new FormData();
        fd.append('Title', form.title.trim());
        fd.append('Order', Number(form.order) || 1);
        fd.append('Type', FILE_TYPE_MAP[form.type] ?? 0);
        fd.append('File', form.file);
        fd.append('DurationInSeconds', (Number(form.duration) || 0) * 60);

        const result = await dispatch(createLessonThunk({ courseId, sectionId, formData: fd }));
        setLessonsLoading(false);

        if (createLessonThunk.fulfilled.match(result)) {
            toast.success('Lesson uploaded successfully! 🎥');
            setLessonForms((p) => ({ ...p, [sectionId]: null }));
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to add lesson');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        const result = await dispatch(deleteLessonThunk(lessonId));
        if (deleteLessonThunk.fulfilled.match(result)) {
            toast.success('Lesson deleted');
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to delete lesson');
        }
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-transparent';
    const courseThumbnailUrl = thumbnailPreview || course.thumbnail || 'https://placehold.co/128x96?text=No+Image';

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-4 transition-colors">
                    <HiArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Edit <span className="gradient-text">Course</span></h1>
                        <p className="text-text-secondary text-sm">Update metadata, structure sections, and upload lessons</p>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-200 dark:border-red-900/40 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-semibold">
                        <HiTrash className="w-4 h-4" /> Delete Course
                    </button>
                </div>
            </motion.div>

            {/* Course Details Form */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Course Details</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Thumbnail Cover</label>
                        <div className="relative group aspect-video rounded-xl overflow-hidden border border-border">
                            <img src={courseThumbnailUrl} alt="" className="w-full h-full object-cover bg-surface" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <HiUpload className="w-6 h-6 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                            </label>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Title</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Short Description</label>
                            <input type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className={inputClass} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Description / Detailed Outline</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className={inputClass + ' resize-none'} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                        <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })} className={inputClass}>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Level</label>
                        <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className={inputClass}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Price ($)</label>
                        <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className={inputClass} />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/60">
                    <button onClick={handleSave} disabled={coursesLoading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60">
                        {coursesLoading ? (
                            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                        ) : (
                            <><HiSave className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>

            {/* Sections & Lessons */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Course Syllabus</h3>
                    <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-md font-medium border border-primary-100">
                        {sections.length} Sections
                    </span>
                </div>

                {/* Add Section input */}
                <div className="flex gap-2 bg-surface p-4 rounded-xl border border-border">
                    <input
                        type="text"
                        placeholder="e.g. Intermediate syntax and arrays"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className={inputClass + ' flex-1 bg-card'}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                    />
                    <button onClick={handleAddSection} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1 transition-colors">
                        <HiPlus className="w-4 h-4" /> Add Section
                    </button>
                </div>

                {/* Dynamic Section Accordion List */}
                <div className="space-y-4">
                    {sections.length === 0 ? (
                        <p className="text-sm text-text-secondary text-center py-6 italic">No sections created yet. Add a section above.</p>
                    ) : (
                        [...sections].sort((a, b) => a.order - b.order).map((section, idx, arr) => {
                            const isExpanded = expandedSection === section.id;
                            const currentForm = lessonForms[section.id] || { title: '', type: 'video', duration: '', order: (section.lessons?.length || 0) + 1, file: null };

                            return (
                                <div key={section.id} className="border border-border rounded-xl bg-surface overflow-hidden shadow-xs">
                                    {/* Section Header Row */}
                                    <div className="flex items-center justify-between p-4 border-b border-border bg-card/25">
                                        <div className="flex-1 mr-4">
                                            {editingSectionId === section.id ? (
                                                <div className="flex gap-2 w-full max-w-md">
                                                    <input
                                                        type="text"
                                                        value={editingSectionTitle}
                                                        onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                        className={inputClass + ' py-1'}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSaveSectionTitle(section.id, section.order)}
                                                        className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 shrink-0"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingSectionId(null)}
                                                        className="px-3 py-1 bg-gray-200 dark:bg-primary-900/40 text-text-secondary rounded-lg text-xs font-semibold shrink-0"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                                                    className="flex items-center gap-3 text-left font-bold text-text-primary group"
                                                >
                                                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded">
                                                        {section.order}
                                                    </span>
                                                    <span className="group-hover:text-primary-500 transition-colors">{section.title}</span>
                                                    <span className="text-xs text-text-secondary font-normal">
                                                        ({(section.lessons || []).length} lessons)
                                                    </span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Reorder controls */}
                                            <button
                                                onClick={() => handleReorderSection(section, 'up')}
                                                disabled={idx === 0 || sectionsLoading}
                                                className="p-1 text-gray-400 hover:text-text-primary disabled:opacity-30"
                                                title="Move Up"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                onClick={() => handleReorderSection(section, 'down')}
                                                disabled={idx === arr.length - 1 || sectionsLoading}
                                                className="p-1 text-gray-400 hover:text-text-primary disabled:opacity-30"
                                                title="Move Down"
                                            >
                                                ▼
                                            </button>

                                            <div className="w-[1px] h-4 bg-border mx-1" />

                                            <button onClick={() => handleStartEditSection(section)} className="p-1.5 text-primary-500 hover:bg-primary-50 rounded" title="Edit Section Title">
                                                <HiPencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteSection(section.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Section">
                                                <HiTrash className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setExpandedSection(isExpanded ? null : section.id)} className="p-1.5 hover:bg-card rounded ml-1 text-gray-400">
                                                {isExpanded ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lessons list and file uploading inside Section */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="p-4 bg-card/30 space-y-4">

                                                    {/* Inline Lesson Upload Card */}
                                                    <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Upload Lesson</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-text-secondary mb-1">Title *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Variables and assignments"
                                                                    value={currentForm.title}
                                                                    onChange={(e) => handleLessonFormChange(section.id, 'title', e.target.value)}
                                                                    className={inputClass + ' py-1.5'}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Type</label>
                                                                    <select
                                                                        value={currentForm.type}
                                                                        onChange={(e) => handleLessonFormChange(section.id, 'type', e.target.value)}
                                                                        className={inputClass + ' py-1.5'}
                                                                    >
                                                                        <option value="video">Video</option>
                                                                        <option value="pdf">PDF</option>
                                                                        <option value="image">Image</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Duration (min)</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        placeholder="10"
                                                                        value={currentForm.duration}
                                                                        onChange={(e) => handleLessonFormChange(section.id, 'duration', e.target.value)}
                                                                        className={inputClass + ' py-1.5'}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <label className="bg-surface border border-border px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-card text-text-secondary transition-colors inline-flex items-center gap-1.5">
                                                                <HiUpload className="w-3.5 h-3.5" /> Choose Media File *
                                                                <input type="file" className="hidden" onChange={(e) => handleLessonFormChange(section.id, 'file', e.target.files[0])} />
                                                            </label>
                                                            <span className="text-xs text-text-secondary truncate">
                                                                {currentForm.file ? `${currentForm.file.name} (${(currentForm.file.size / 1024 / 1024).toFixed(2)} MB)` : 'No file chosen'}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-end pt-2 border-t border-border/50">
                                                            <button
                                                                onClick={() => handleAddLesson(section.id)}
                                                                disabled={lessonsLoading}
                                                                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                                                            >
                                                                {lessonsLoading ? 'Uploading...' : 'Save Lesson'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Existing Lessons list */}
                                                    <div className="space-y-2">
                                                        {(!section.lessons || section.lessons.length === 0) ? (
                                                            <p className="text-xs text-text-secondary italic text-center py-2">No lessons uploaded in this section yet</p>
                                                        ) : (
                                                            [...section.lessons].sort((a, b) => a.order - b.order).map((lesson) => (
                                                                <div key={lesson.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl text-sm">
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <span className="text-xs font-bold text-gray-400 bg-surface px-1.5 py-0.5 rounded">
                                                                            {lesson.order}
                                                                        </span>
                                                                        {lesson.type === 0 && <HiPhotograph className="w-4 h-4 text-emerald-500 shrink-0" />}
                                                                        {lesson.type === 1 && <HiPlay className="w-4 h-4 text-primary-500 shrink-0" />}
                                                                        {lesson.type === 2 && <HiDocumentText className="w-4 h-4 text-amber-500 shrink-0" />}
                                                                        <p className="font-semibold text-text-primary truncate">{lesson.title}</p>
                                                                        {lesson.durationInSeconds > 0 && (
                                                                            <span className="text-xs text-gray-400 shrink-0">
                                                                                ({Math.round(lesson.durationInSeconds / 60)}m)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Delete Lesson">
                                                                        <HiTrash className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Quizzes List */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Course Quizzes</h3>
                    <button onClick={() => navigate(`/instructor/courses/${courseId}/quiz/new`)} className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
                        <HiPlus className="w-3.5 h-3.5" /> Create Quiz
                    </button>
                </div>
                {courseQuizzes.length > 0 ? (
                    <div className="space-y-2">
                        {courseQuizzes.map((q) => (
                            <div key={q.id} className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-xl">
                                <span className="text-sm font-semibold text-text-primary">📝 {q.title}</span>
                                <span className="text-xs text-text-secondary">({q.questions?.length || 0} questions)</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">No quizzes created yet. Create a quiz to attach it to this course.</p>
                )}
            </div>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Course?">
                <div className="p-6 text-center">
                    <p className="text-text-secondary mb-4">Are you sure you want to delete "<b>{course.title}</b>"? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold">Cancel</button>
                        <button onClick={handleDelete} disabled={coursesLoading} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors">{coursesLoading ? 'Deleting...' : 'Delete'}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EditCourse;
