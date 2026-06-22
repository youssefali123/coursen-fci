import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiArrowLeft, 
    HiArrowRight, 
    HiCheck, 
    HiPlus, 
    HiTrash, 
    HiUpload, 
    HiPencil, 
    HiFolder, 
    HiChevronDown, 
    HiChevronUp, 
    HiPlay, 
    HiDocumentText, 
    HiPhotograph, 
    HiExclamation 
} from 'react-icons/hi';
import { useDropzone } from 'react-dropzone';
import { createCourseThunk, fetchSectionsWithLessons } from '../../features/coursesSlice';
import { createSectionThunk, updateSectionThunk, deleteSectionThunk, createLessonThunk, deleteLessonThunk } from '../../features/sectionSlice';
import { fetchCategories } from '../../features/categorySlice';
import toast from 'react-hot-toast';

// API maps
const LEVEL_MAP = { Beginner: 0, Intermediate: 1, Advanced: 2 };
const LEVEL_LABELS = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' };
const FILE_TYPE_MAP = { image: 0, video: 1, pdf: 2 };
const FILE_TYPE_LABELS = { 0: 'Image', 1: 'Video', 2: 'PDF' };

const steps = ['Course Info', 'Sections', 'Lessons', 'Review'];

const CreateCourse = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading: coursesLoading } = useSelector((s) => s.courses);
    const { categories } = useSelector((s) => s.category);
    const { sections } = useSelector((s) => s.courses); // from fetchSectionsWithLessons

    const [currentStep, setCurrentStep] = useState(0);
    const [courseId, setCourseId] = useState(null);

    // Form states
    const [courseData, setCourseData] = useState({
        title: '',
        shortDescription: '',
        longDescription: '',
        categoryId: '',
        level: 'Beginner',
        price: '',
    });
    const [thumbnail, setThumbnail] = useState(null);

    // Section management states
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editingSectionTitle, setEditingSectionTitle] = useState('');
    const [sectionsLoading, setSectionsLoading] = useState(false);

    // Lesson management states
    const [expandedSection, setExpandedSection] = useState(null);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [lessonForm, setLessonForm] = useState({
        title: '',
        type: 'video',
        duration: '', // in minutes
        order: 1,
        file: null,
    });

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (categories && categories.length > 0 && !courseData.categoryId) {
            setCourseData(prev => ({ ...prev, categoryId: categories[0].id }));
        }
    }, [categories, courseData.categoryId]);

    // Thumbnail Dropzone
    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        onDrop: (files) => setThumbnail(Object.assign(files[0], { preview: URL.createObjectURL(files[0]) })),
    });

    const updateCourseField = (field, value) => {
        setCourseData((prev) => ({ ...prev, [field]: value }));
    };

    // --- STEP 1: CREATE COURSE ---
    const handleCreateCourse = async () => {
        if (!courseData.title.trim()) {
            toast.error('Course title is required');
            return;
        }
        if (!courseData.categoryId) {
            toast.error('Category is required');
            return;
        }

        const apiPayload = {
            title: courseData.title.trim(),
            shortDescription: courseData.shortDescription.trim() || '',
            longDescription: courseData.longDescription.trim() || '',
            categoryId: Number(courseData.categoryId),
            level: LEVEL_MAP[courseData.level] ?? 0,
            price: Number(courseData.price) || 0,
        };

        const result = await dispatch(createCourseThunk({
            courseData: apiPayload,
            thumbnailFile: thumbnail || null,
        }));

        if (createCourseThunk.fulfilled.match(result)) {
            const created = result.payload;
            const id = created?.id ?? created?.courseId;
            if (id) {
                setCourseId(id);
                toast.success('Course created! Now let\'s add sections. 📁');
                dispatch(fetchSectionsWithLessons(id));
                setCurrentStep(1);
            } else {
                toast.error('Failed to retrieve created course ID');
            }
        } else {
            toast.error(result.payload || 'Failed to create course');
        }
    };

    // --- STEP 2: SECTION CRUD ---
    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) {
            toast.error('Section title is required');
            return;
        }
        setSectionsLoading(true);
        const order = sections.length + 1;
        const result = await dispatch(createSectionThunk({
            courseId,
            title: newSectionTitle.trim(),
            order,
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
        if (!window.confirm('Are you sure you want to delete this section and all its lessons?')) return;
        setSectionsLoading(true);
        const result = await dispatch(deleteSectionThunk(sectionId));
        setSectionsLoading(false);

        if (deleteSectionThunk.fulfilled.match(result)) {
            toast.success('Section deleted!');
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
        // Swap their orders
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

    // --- STEP 3: LESSON CRUD ---
    const handleLessonFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLessonForm(prev => ({ ...prev, file }));
    };

    const handleAddLesson = async (sectionId) => {
        if (!lessonForm.title.trim()) {
            toast.error('Lesson title is required');
            return;
        }
        if (!lessonForm.file) {
            toast.error('Please upload a file for the lesson');
            return;
        }

        setLessonsLoading(true);
        const fd = new FormData();
        fd.append('Title', lessonForm.title.trim());
        fd.append('Order', Number(lessonForm.order) || 1);
        fd.append('Type', FILE_TYPE_MAP[lessonForm.type] ?? 0);
        fd.append('File', lessonForm.file);
        fd.append('DurationInSeconds', (Number(lessonForm.duration) || 0) * 60);

        const result = await dispatch(createLessonThunk({
            courseId,
            sectionId,
            formData: fd,
        }));
        setLessonsLoading(false);

        if (createLessonThunk.fulfilled.match(result)) {
            toast.success('Lesson uploaded successfully! 🎥');
            setLessonForm({
                title: '',
                type: 'video',
                duration: '',
                order: (sections.find(s => s.id === sectionId)?.lessons?.length || 0) + 2,
                file: null,
            });
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to upload lesson');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        setLessonsLoading(true);
        const result = await dispatch(deleteLessonThunk(lessonId));
        setLessonsLoading(false);

        if (deleteLessonThunk.fulfilled.match(result)) {
            toast.success('Lesson deleted!');
            dispatch(fetchSectionsWithLessons(courseId));
        } else {
            toast.error(result.payload || 'Failed to delete lesson');
        }
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-card';

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Create <span className="gradient-text">New Course</span></h1>
                    <p className="text-text-secondary text-sm">Follow the steps to configure and publish your course content</p>
                </div>
                {courseId && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
                        Course ID: {courseId}
                    </span>
                )}
            </motion.div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                i === currentStep 
                                ? 'bg-primary-500 text-white ring-4 ring-primary-100' 
                                : i < currentStep 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-gray-200 text-text-secondary dark:bg-primary-900/40'
                            }`}>
                                {i < currentStep ? <HiCheck className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-sm hidden md:block ${i <= currentStep ? 'font-semibold text-text-primary' : 'text-gray-400'}`}>{step}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 ${i < currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-primary-900/20'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Content Container */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentStep} 
                    initial={{ opacity: 0, x: 15 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -15 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[400px] flex flex-col justify-between"
                >
                    <div>
                        {/* STEP 0: Course Info */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Step 1: Course Information</h2>
                                
                                {/* Thumbnail Upload */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-text-secondary mb-2">Course Thumbnail</label>
                                        <div {...getRootProps()} className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 transition-colors bg-surface aspect-video flex flex-col justify-center items-center">
                                            <input {...getInputProps()} />
                                            {thumbnail ? (
                                                <div className="relative w-full h-full">
                                                    <img src={thumbnail.preview} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                        <p className="text-white text-xs font-medium">Change Photo</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <HiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-xs text-text-secondary">Drag & drop or browse</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-text-secondary mb-1">Course Title *</label>
                                            <input 
                                                type="text" 
                                                value={courseData.title} 
                                                onChange={(e) => updateCourseField('title', e.target.value)} 
                                                placeholder="e.g. Master C# and .NET Core" 
                                                className={inputClass} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text-secondary mb-1">Short Description *</label>
                                            <input 
                                                type="text" 
                                                value={courseData.shortDescription} 
                                                onChange={(e) => updateCourseField('shortDescription', e.target.value)} 
                                                placeholder="Give a brief summary of the course target" 
                                                className={inputClass} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-1">Long / Detailed Description</label>
                                    <textarea 
                                        value={courseData.longDescription} 
                                        onChange={(e) => updateCourseField('longDescription', e.target.value)} 
                                        rows={4} 
                                        placeholder="Detailed description, outline, prerequisites, who this course is for..." 
                                        className={inputClass + ' resize-none'} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-1">Category *</label>
                                        <select 
                                            value={courseData.categoryId} 
                                            onChange={(e) => updateCourseField('categoryId', e.target.value)} 
                                            className={inputClass}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-1">Difficulty Level</label>
                                        <select 
                                            value={courseData.level} 
                                            onChange={(e) => updateCourseField('level', e.target.value)} 
                                            className={inputClass}
                                        >
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-1">Price ($)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            step="0.01" 
                                            value={courseData.price} 
                                            onChange={(e) => updateCourseField('price', e.target.value)} 
                                            placeholder="0.00 (Free)" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Manage Sections */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="border-b border-border pb-2 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-text-primary">Step 2: Course Sections</h2>
                                    <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-md font-medium border border-primary-100">
                                        Total: {sections.length} sections
                                    </span>
                                </div>

                                {/* Section Creator Box */}
                                <div className="bg-surface p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3">
                                    <input 
                                        type="text" 
                                        value={newSectionTitle} 
                                        onChange={(e) => setNewSectionTitle(e.target.value)} 
                                        placeholder="e.g. Introduction & Basics" 
                                        className={inputClass + ' flex-1'}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                                    />
                                    <button 
                                        onClick={handleAddSection} 
                                        disabled={sectionsLoading}
                                        className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors disabled:opacity-60"
                                    >
                                        <HiPlus className="w-4 h-4" /> Add Section
                                    </button>
                                </div>

                                {/* Sections List */}
                                <div className="space-y-3">
                                    {sections.length === 0 ? (
                                        <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-border">
                                            <HiFolder className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-text-secondary">No sections created yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Add at least one section before proceeding</p>
                                        </div>
                                    ) : (
                                        [...sections].sort((a,b) => a.order - b.order).map((section, idx, arr) => (
                                            <div key={section.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                                                <div className="flex-1 mr-4">
                                                    {editingSectionId === section.id ? (
                                                        <div className="flex gap-2 w-full">
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
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
                                                                {section.order}
                                                            </span>
                                                            <p className="text-sm font-semibold text-text-primary">{section.title}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    {/* Reorder controls */}
                                                    <button 
                                                        onClick={() => handleReorderSection(section, 'up')}
                                                        disabled={idx === 0 || sectionsLoading}
                                                        className="p-1 text-gray-400 hover:text-text-primary hover:bg-card rounded disabled:opacity-30"
                                                        title="Move Up"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReorderSection(section, 'down')}
                                                        disabled={idx === arr.length - 1 || sectionsLoading}
                                                        className="p-1 text-gray-400 hover:text-text-primary hover:bg-card rounded disabled:opacity-30"
                                                        title="Move Down"
                                                    >
                                                        ▼
                                                    </button>

                                                    <div className="w-[1px] h-4 bg-border mx-1" />

                                                    <button 
                                                        onClick={() => handleStartEditSection(section)}
                                                        className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Edit Title"
                                                    >
                                                        <HiPencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteSection(section.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Section"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Manage Lessons */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Step 3: Section Lessons</h2>

                                {sections.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-text-secondary">Please add sections first before managing lessons.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sections.map((section) => {
                                            const isExpanded = expandedSection === section.id;
                                            return (
                                                <div key={section.id} className="border border-border rounded-xl overflow-hidden bg-surface shadow-xs">
                                                    {/* Header */}
                                                    <button 
                                                        onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-card transition-colors text-left border-b border-transparent data-[expanded=true]:border-border"
                                                        data-expanded={isExpanded}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-bold text-xs">
                                                                {section.order}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-text-primary">{section.title}</h3>
                                                                <p className="text-xs text-text-secondary mt-0.5">{(section.lessons || []).length} lessons</p>
                                                            </div>
                                                        </div>
                                                        {isExpanded ? <HiChevronUp className="w-5 h-5 text-gray-400" /> : <HiChevronDown className="w-5 h-5 text-gray-400" />}
                                                    </button>

                                                    {/* Expanded Content */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                <div className="p-4 space-y-4 bg-card/30">
                                                                    
                                                                    {/* Add Lesson Form */}
                                                                    <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Upload New Lesson</h4>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                            <div>
                                                                                <label className="block text-[11px] font-semibold text-text-secondary mb-1">Title *</label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    value={lessonForm.title} 
                                                                                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                                                                                    placeholder="e.g. Setting up the Project"
                                                                                    className={inputClass + ' py-1.5'}
                                                                                />
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Type</label>
                                                                                    <select 
                                                                                        value={lessonForm.type} 
                                                                                        onChange={(e) => setLessonForm(prev => ({ ...prev, type: e.target.value }))}
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
                                                                                        value={lessonForm.duration} 
                                                                                        onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                                                                                        placeholder="5"
                                                                                        className={inputClass + ' py-1.5'}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* File Picker */}
                                                                        <div className="flex items-center gap-3">
                                                                            <label className="bg-surface border border-border px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-card text-text-secondary transition-colors inline-flex items-center gap-1.5 shrink-0">
                                                                                <HiUpload className="w-3.5 h-3.5" /> Select File *
                                                                                <input type="file" className="hidden" onChange={handleLessonFileChange} />
                                                                            </label>
                                                                            <span className="text-xs text-text-secondary truncate">
                                                                                {lessonForm.file ? `${lessonForm.file.name} (${(lessonForm.file.size/1024/1024).toFixed(2)} MB)` : 'No file selected'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-end pt-2 border-t border-border/50">
                                                                            <button 
                                                                                onClick={() => handleAddLesson(section.id)}
                                                                                disabled={lessonsLoading}
                                                                                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                                                                            >
                                                                                {lessonsLoading ? 'Uploading...' : 'Upload Lesson'}
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Lessons List */}
                                                                    <div className="space-y-2">
                                                                        {(!section.lessons || section.lessons.length === 0) ? (
                                                                            <p className="text-xs text-text-secondary italic text-center py-2">No lessons uploaded in this section yet</p>
                                                                        ) : (
                                                                            [...section.lessons].sort((a,b) => a.order - b.order).map((lesson) => (
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
                                                                                    <button 
                                                                                        onClick={() => handleDeleteLesson(lesson.id)}
                                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                                                        title="Delete Lesson"
                                                                                    >
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
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: Review & Publish */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Step 4: Review Course & Finish</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left summary card */}
                                    <div className="space-y-4">
                                        <div className="bg-surface p-4 rounded-xl border border-border">
                                            <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Course Summary</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between border-b border-border/55 pb-2">
                                                    <span className="text-text-secondary">Title</span>
                                                    <span className="font-semibold text-text-primary">{courseData.title}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/55 pb-2">
                                                    <span className="text-text-secondary">Difficulty</span>
                                                    <span className="font-semibold text-text-primary">{courseData.level}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/55 pb-2">
                                                    <span className="text-text-secondary">Category</span>
                                                    <span className="font-semibold text-text-primary">
                                                        {categories.find(c => String(c.id) === String(courseData.categoryId))?.name || '—'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pb-1">
                                                    <span className="text-text-secondary">Price</span>
                                                    <span className="font-semibold text-text-primary">
                                                        {Number(courseData.price) > 0 ? `$${Number(courseData.price).toFixed(2)}` : 'Free'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {thumbnail && (
                                            <div className="bg-surface p-4 rounded-xl border border-border">
                                                <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Cover Image</h3>
                                                <img src={thumbnail.preview} alt="Thumbnail preview" className="w-full h-36 object-cover rounded-lg" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Right syllabus structure */}
                                    <div className="bg-surface p-4 rounded-xl border border-border">
                                        <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Syllabus Overview</h3>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                            {sections.length === 0 ? (
                                                <p className="text-xs text-text-secondary italic">No sections created.</p>
                                            ) : (
                                                sections.map((section) => (
                                                    <div key={section.id} className="border-l-2 border-primary-500 pl-3 py-0.5">
                                                        <h4 className="text-sm font-bold text-text-primary">{section.title}</h4>
                                                        <ul className="text-xs text-text-secondary mt-1 space-y-1">
                                                            {(!section.lessons || section.lessons.length === 0) ? (
                                                                <li className="italic text-gray-400">No lessons</li>
                                                            ) : (
                                                                section.lessons.map(l => (
                                                                    <li key={l.id} className="flex items-center gap-1.5">
                                                                        <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                                                                        <span className="truncate">{l.title}</span>
                                                                        {l.durationInSeconds > 0 && ` (${Math.round(l.durationInSeconds/60)}m)`}
                                                                    </li>
                                                                ))
                                                            )}
                                                        </ul>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex gap-3 text-sm">
                                    <HiExclamation className="w-5 h-5 text-amber-500 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-amber-800 dark:text-amber-300">All set! Course is live in draft/published mode.</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">You can edit section order, update lesson details, or upload additional materials anytime via the Edit Course page.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
                        <button
                            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                            disabled={currentStep === 0 || currentStep === 3}
                            className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                        >
                            <HiArrowLeft className="w-4 h-4" /> Back
                        </button>

                        {currentStep === 0 && (
                            <button
                                onClick={handleCreateCourse}
                                disabled={coursesLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-500/10 transition-all disabled:opacity-60"
                            >
                                {coursesLoading ? 'Creating Course...' : 'Create Course & Continue'} <HiArrowRight className="w-4 h-4" />
                            </button>
                        )}

                        {currentStep === 1 && (
                            <button
                                onClick={() => {
                                    if (sections.length === 0) {
                                        toast.error('Please add at least one section before continuing');
                                        return;
                                    }
                                    setExpandedSection(sections[0]?.id || null);
                                    setCurrentStep(2);
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-500/10 transition-all"
                            >
                                Continue to Lessons <HiArrowRight className="w-4 h-4" />
                            </button>
                        )}

                        {currentStep === 2 && (
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-500/10 transition-all"
                            >
                                Continue to Review <HiArrowRight className="w-4 h-4" />
                            </button>
                        )}

                        {currentStep === 3 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
                                    className="px-5 py-2.5 border border-border hover:bg-surface text-text-primary rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Detailed Edit
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Course wizard finished! 🎉');
                                        navigate('/instructor/dashboard');
                                    }}
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CreateCourse;
