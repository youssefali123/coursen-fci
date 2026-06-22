import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiPlay, HiDocumentText, HiPhotograph, HiCheckCircle, HiChevronDown, HiChevronUp, HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { completeLesson, fetchCourseData, fetchLessonDetails } from '../../features/coursesSlice';
import { fetchQuizzesByCourseThunk } from '../../features/quizSlice';
import ProgressBar from '../../components/common/ProgressBar';
import toast from 'react-hot-toast';

// Set up pdfjs worker — use the worker bundled with react-pdf (avoids CDN version mismatches)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

// Lesson type enum mapping — 0=Image, 1=Video, 2=PDF
const LESSON_TYPE_ENUM = {
  0: { type: 'image', label: 'Image', icon: HiPhotograph },
  1: { type: 'video', label: 'Video', icon: HiPlay },
  2: { type: 'document', label: 'Document', icon: HiDocumentText }
};

const getLessonTypeInfo = (lessonType) => {
  const type = typeof lessonType === 'number' ? lessonType : 0;
  return LESSON_TYPE_ENUM[type] || LESSON_TYPE_ENUM[0];
};

const LEVEL_LABELS = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' };

// Helper functions to get file type from URL
const getFileTypeFromUrl = (url) => {
    if (!url) return null;
    // Strip query parameters and hash from URL
    const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase().trim();
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.m4v') || cleanUrl.endsWith('.avi')) return 'video';
    if (cleanUrl.endsWith('.pdf')) return 'pdf';
    if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.png') || cleanUrl.endsWith('.webp') || cleanUrl.endsWith('.gif') || cleanUrl.endsWith('.bmp')) return 'image';
    return 'other';
};

const getLessonFileType = (lessonType, fileUrl) => {
    if (fileUrl) {
        const fileTypeFromUrl = getFileTypeFromUrl(fileUrl);
        if (fileTypeFromUrl && fileTypeFromUrl !== 'other') {
            return fileTypeFromUrl;
        }
    }
    // Fallback to lesson type enum if fileUrl doesn't give us a clear type
    if (lessonType === 0) return 'image';
    if (lessonType === 1) return 'video';
    if (lessonType === 2) return 'pdf';
    return 'other';
};

const CoursePlayer = () => {
    const { id } = useParams();
    const courseId = Number(id);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentCourseData, sections, completedLessons: completedMap, loading, lessonDetails, loadingLessonDetails } = useSelector((s) => s.courses);
    const { courseQuizzes } = useSelector((s) => s.quiz);
    const { isAuthenticated, user } = useSelector((s) => s.auth);
    const [expandedSections, setExpandedSections] = useState([]);
    const [pdfPage, setPdfPage] = useState(1);
    const [pdfNumPages, setPdfNumPages] = useState(null);
    const [pdfLoadError, setPdfLoadError] = useState(false);
    const completed = completedMap[courseId] || [];

    const course = currentCourseData;

    // Sort sections and lessons by order
    const sortedSections = useMemo(() => {
        return sections
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(section => ({
                ...section,
                lessons: (section.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))
            }));
    }, [sections]);

    // Flatten lessons for easy navigation
    const allLessons = useMemo(() => {
        return sortedSections
            .flatMap(section => 
                (section.lessons || [])
                    .map(lesson => ({ ...lesson, sectionId: section.id }))
            );
    }, [sortedSections]);

    // Find active lesson from URL or default to first
    const activeLessonIdFromUrl = searchParams.get('lessonId');
    const activeLesson = useMemo(() => {
        if (activeLessonIdFromUrl) {
            return allLessons.find(lesson => lesson.id === Number(activeLessonIdFromUrl));
        }
        return allLessons[0] || null;
    }, [allLessons, activeLessonIdFromUrl]);

    // Find active lesson index for navigation
    const activeLessonIndex = useMemo(() => {
        return allLessons.findIndex(lesson => lesson.id === activeLesson?.id);
    }, [allLessons, activeLesson]);

    useEffect(() => {
        dispatch(fetchCourseData(courseId));
        dispatch(fetchQuizzesByCourseThunk(courseId));
    }, [dispatch, courseId]);

    // Fetch lesson details when active lesson changes
    useEffect(() => {
        if (activeLesson) {
            dispatch(fetchLessonDetails({ courseId, lessonId: activeLesson.id }));
            setPdfPage(1); // Reset to first page when lesson changes
            setPdfLoadError(false); // Clear any previous load error
        }
    }, [dispatch, courseId, activeLesson]);

    // Reset PDF error state when the lesson URL changes
    useEffect(() => {
        setPdfLoadError(false);
        setPdfPage(1);
        setPdfNumPages(null);
    }, [lessonDetails?.fileUrl]);

    // Initialize expanded sections
    useEffect(() => {
        if (sortedSections.length > 0) {
            if (activeLesson) {
                // Expand the section containing active lesson
                setExpandedSections(prev => 
                    prev.includes(activeLesson.sectionId) 
                        ? prev 
                        : [...prev, activeLesson.sectionId]
                );
            } else if (sortedSections[0]) {
                setExpandedSections([sortedSections[0].id]);
            }
        }
    }, [sortedSections, activeLesson]);

    const totalLessons = allLessons.length || 1;
    const progress = Math.round((completed.length / totalLessons) * 100);
    const totalSections = sortedSections.length;

    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => 
            prev.includes(sectionId) 
                ? prev.filter((id) => id !== sectionId) 
                : [...prev, sectionId]
        );
    };

    const handleLessonClick = (lesson) => {
        setSearchParams({ lessonId: String(lesson.id) });
        // Expand section if not already expanded
        if (!expandedSections.includes(lesson.sectionId)) {
            setExpandedSections(prev => [...prev, lesson.sectionId]);
        }
    };

    const handleComplete = () => {
        if (activeLesson && !completed.includes(activeLesson.id)) {
            dispatch(completeLesson({ courseId, lessonId: activeLesson.id }));
            toast.success('Lesson completed! 🎉');
        }
    };

    const navigateToLesson = (direction) => {
        const newIndex = activeLessonIndex + direction;
        if (newIndex >= 0 && newIndex < allLessons.length) {
            const nextLesson = allLessons[newIndex];
            handleLessonClick(nextLesson);
        }
    };

    const canGoPrevious = activeLessonIndex > 0;
    const canGoNext = activeLessonIndex < allLessons.length - 1;

    if (loading && !course) return (
        <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading course...</p>
        </div>
    );

    if (!course && !loading) return (
        <div className="text-center py-20">
            <p className="text-xl text-text-secondary">Course not found</p>
        </div>
    );

    const levelLabel = typeof course.level === 'number' ? LEVEL_LABELS[course.level] : (course.level || 'Beginner');
    const instructorName = course.user?.name || course.instructorName || 'Instructor';
    const categoryName = course.category?.name || course.categoryName || '';
    const thumbnail = course.thumbnail ? course.thumbnail.trim().replace(/`/g, '') : null;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Course Header */}
            <div className="bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="flex-1">
                            <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-white mb-4 transition-colors">
                                <HiArrowLeft className="w-4 h-4" /> Back to Course
                            </Link>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{course.title}</h1>
                            {course.shortDescription && (
                                <p className="text-indigo-200 mb-3">{course.shortDescription}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs">👤</div>
                                    {instructorName}
                                </span>
                                {categoryName && (
                                    <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-xs">
                                        {categoryName}
                                    </span>
                                )}
                                <span className="text-indigo-300">{levelLabel}</span>
                                <span className="text-indigo-300">•</span>
                                <span>{totalSections} Sections</span>
                                <span className="text-indigo-300">•</span>
                                <span>{totalLessons} Lessons</span>
                            </div>
                        </div>
                        {thumbnail && (
                            <img 
                                src={thumbnail} 
                                alt={course.title} 
                                className="w-full lg:w-64 h-36 object-cover rounded-xl shadow-lg"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-7xl mx-auto w-full flex-1">
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Lesson Viewer */}
                    <div className="bg-black rounded-2xl overflow-hidden mb-4 aspect-video">
                        {loadingLessonDetails ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-sm text-gray-400">Loading lesson...</p>
                                </div>
                            </div>
                        ) : lessonDetails && lessonDetails.fileUrl ? (
                            (() => {
                                const fileType = getLessonFileType(activeLesson?.type, lessonDetails.fileUrl);
                                const cleanFileUrl = lessonDetails.fileUrl?.trim().replace(/`/g, '');
                                if (fileType === 'video') {
                                    return <video src={cleanFileUrl} style={{display: 'block', width: '100%', height: '100%'}} controls />;
                                } else if (fileType === 'pdf') {
                                    return (
                                        <div className="flex flex-col items-center h-full bg-white overflow-auto">
                                            {pdfLoadError ? (
                                                // Fallback: embed directly in an iframe when react-pdf fails
                                                <iframe
                                                    src={cleanFileUrl}
                                                    className="w-full h-full border-0"
                                                    title="PDF Viewer"
                                                />
                                            ) : (
                                                <Document
                                                    file={cleanFileUrl}
                                                    onLoadSuccess={({ numPages }) => {
                                                        setPdfNumPages(numPages);
                                                        setPdfLoadError(false);
                                                    }}
                                                    onLoadError={(error) => {
                                                        console.error('PDF Load Error:', error);
                                                        setPdfLoadError(true);
                                                    }}
                                                    loading={
                                                        <div className="flex items-center justify-center h-full">
                                                            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
                                                        </div>
                                                    }
                                                    options={{
                                                        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                                                        cMapPacked: true,
                                                        withCredentials: false,
                                                    }}
                                                >
                                                    {pdfNumPages && (
                                                        <div className="sticky top-0 z-10 bg-gray-100 w-full px-4 py-2 flex items-center justify-between gap-4 shadow-sm">
                                                            <button
                                                                onClick={() => setPdfPage((prev) => Math.max(prev - 1, 1))}
                                                                disabled={pdfPage <= 1}
                                                                className="px-3 py-1 bg-primary-500 text-white rounded disabled:opacity-50"
                                                            >
                                                                Previous
                                                            </button>
                                                            <span className="text-text-primary text-sm">
                                                                Page {pdfPage} of {pdfNumPages}
                                                            </span>
                                                            <button
                                                                onClick={() => setPdfPage((prev) => Math.min(prev + 1, pdfNumPages))}
                                                                disabled={pdfPage >= pdfNumPages}
                                                                className="px-3 py-1 bg-primary-500 text-white rounded disabled:opacity-50"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="p-4">
                                                        <Page
                                                            pageNumber={pdfPage}
                                                            width={Math.min(window.innerWidth - 40, 800)}
                                                        />
                                                    </div>
                                                </Document>
                                            )}
                                        </div>
                                    );
                                } else if (fileType === 'image') {
                                    return (
                                        <div className="flex items-center justify-center h-full bg-gray-900">
                                            <img src={cleanFileUrl} alt={lessonDetails.title} className="max-w-full max-h-full object-contain" />
                                        </div>
                                    );
                                } else if (fileType === 'document') {
                                    return (
                                        <div className="flex items-center justify-center h-full bg-gray-900">
                                            <div className="text-center p-8">
                                                <HiDocumentText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-white mb-2">{lessonDetails.title || activeLesson?.title}</h3>
                                                <p className="text-sm text-gray-300">Document previews are not available in this version</p>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="flex items-center justify-center h-full bg-gray-900">
                                            <div className="text-center p-8">
                                                <HiDocumentText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-white mb-2">{lessonDetails.title || activeLesson?.title}</h3>
                                                <p className="text-sm text-gray-300">File format not supported for preview</p>
                                            </div>
                                        </div>
                                    );
                                }
                            })()
                        ) : getLessonTypeInfo(activeLesson?.type).type === 'quiz' ? (
                            <div className="flex items-center justify-center h-full bg-surface">
                                <div className="text-center p-8">
                                    <HiCheckCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-text-secondary mb-4">{activeLesson?.title}</h3>
                                    {courseQuizzes.length > 0 && (
                                        <Link to={`/student/quiz/${courseQuizzes[0].id}`} className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all">
                                            Start Quiz
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">Lesson content not available</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">{activeLesson?.title || 'Select a lesson'}</h2>
                            <p className="text-sm text-text-secondary mt-1">
                                {activeLesson ? getLessonTypeInfo(activeLesson.type).label : ''}
                                {activeLesson?.durationInSeconds ? ` • ${Math.round(activeLesson.durationInSeconds / 60)}m` : ''}
                            </p>
                        </div>
                        {activeLesson && (
                            <button onClick={handleComplete} disabled={completed.includes(activeLesson?.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${completed.includes(activeLesson?.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
                                <HiCheckCircle className="w-4 h-4" />
                                {completed.includes(activeLesson?.id) ? 'Completed' : 'Mark Complete'}
                            </button>
                        )}
                    </div>

                    {/* Previous/Next Buttons */}
                    <div className="flex items-center justify-between mt-auto">
                        <button 
                            onClick={() => navigateToLesson(-1)} 
                            disabled={!canGoPrevious}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${canGoPrevious ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                        >
                            <HiArrowLeft className="w-4 h-4" /> Previous Lesson
                        </button>
                        <button 
                            onClick={() => navigateToLesson(1)} 
                            disabled={!canGoNext}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${canGoNext ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                        >
                            Next Lesson <HiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sidebar - Course Content */}
                <div className="w-full lg:w-80 shrink-0 bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-text-primary">Course Content</h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
                            <ProgressBar value={progress} size="sm" className="flex-1" />
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-2">{completed.length}/{totalLessons} Lessons Completed</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sortedSections.map((section) => (
                            <div key={section.id}>
                                <button onClick={() => toggleSection(section.id)}
                                    className="w-full px-4 py-3 bg-surface flex items-center justify-between text-sm font-medium text-text-secondary hover:bg-gray-100">
                                    <span className="truncate">{section.title}</span>
                                    {expandedSections.includes(section.id) ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                                </button>
                                {expandedSections.includes(section.id) && (
                                    <div className="divide-y divide-gray-50">
                                        {(section.lessons || []).map((lesson) => {
                                            const typeInfo = getLessonTypeInfo(lesson.type);
                                            const isActive = activeLesson?.id === lesson.id;
                                            const isCompleted = completed.includes(lesson.id);
                                            
                                            return (
                                                <button 
                                                    key={lesson.id} 
                                                    onClick={() => handleLessonClick({ ...lesson, sectionId: section.id })}
                                                    className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-primary-50 transition-colors ${isActive ? 'bg-primary-50 border-l-2 border-primary-500' : ''}`}
                                                >
                                                    {isCompleted ? 
                                                        <HiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : 
                                                        <typeInfo.icon className="w-4 h-4 text-gray-400 shrink-0" />
                                                    }
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-xs truncate ${isActive ? 'font-semibold text-primary-700' : 'text-text-secondary'}`}>{lesson.title}</p>
                                                        {lesson.durationInSeconds && <p className="text-[10px] text-gray-400">{Math.round(lesson.durationInSeconds / 60)}m</p>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                        {courseQuizzes.length > 0 && (
                            <div className="p-4 border-t border-border">
                                <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Quizzes</p>
                                {courseQuizzes.map((q) => (
                                    <Link key={q.id} to={`/student/quiz/${q.id}`} className="block px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-medium">📝 {q.title}</Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
