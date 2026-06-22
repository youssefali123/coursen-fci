import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiStar, HiUsers, HiClock, HiPlay, HiDocumentText, HiPhotograph, HiCheckCircle, HiAcademicCap, HiArrowLeft } from 'react-icons/hi';
import { enrollCourse, fetchCourseData, fetchStudentCourses } from '../../features/coursesSlice';
import { fetchQuizzesByCourseThunk } from '../../features/quizSlice';
import * as paymentApi from '../../features/payment/payment.api';
import toast from 'react-hot-toast';

const LEVEL_LABELS = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' };

const CourseDetail = () => {
    const { id } = useParams();
    const courseId = Number(id);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { courses, currentCourse, currentCourseData, sections, enrolledCourses, loading } = useSelector((s) => s.courses);
    const { courseQuizzes } = useSelector((s) => s.quiz);
    const { isAuthenticated, user } = useSelector((s) => s.auth);
    const [activeTab, setActiveTab] = useState('overview');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    useEffect(() => {
        dispatch(fetchCourseData(courseId));
        dispatch(fetchQuizzesByCourseThunk(courseId));
        dispatch(fetchStudentCourses()); // Fetch student's enrolled courses
    }, [dispatch, courseId]);

    const course = currentCourseData || currentCourse || courses.find((c) => c.id === courseId);
    const isEnrolled = enrolledCourses.includes(courseId);

    // Redirect to CoursePlayer if student is already enrolled
    useEffect(() => {
        if (isEnrolled) {
            navigate(`/student/courses/${courseId}`, { replace: true });
        }
    }, [isEnrolled, courseId, navigate]);
    const [expandedSections, setExpandedSections] = useState([]);

    // Sort sections and lessons by order
    const sortedSections = sections
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(section => ({
            ...section,
            lessons: (section.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))
        }));

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId) 
                : [...prev, sectionId]
        );
    };

    if (loading && !course) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" /><p className="text-sm text-text-secondary">Loading...</p></div>;
    if (!course) return <div className="text-center py-20"><p className="text-xl text-text-secondary">Course not found</p><Link to="/courses" className="text-primary-600 mt-4 inline-block">Browse Courses</Link></div>;

    const level = typeof course.level === 'number' ? LEVEL_LABELS[course.level] : (course.level || 'Beginner');
    const rating = course.rate ?? course.rating ?? 0;
    const studentsCount = course.enrollments?.length ?? course.studentsCount ?? 0;
    const instructorName = course.user?.name || course.instructorName || 'Instructor';
    const instructorAvatar = course.user?.pathOfImage || course.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructorName}`;
    const thumbnail = course.thumbnail ? course.thumbnail.trim().replace(/`/g, '') : 'https://placehold.co/600x300?text=Course';
    const description = course.shortDescription || course.description || '';
    const longDescription = course.longDescription || description;
    const price = course.price ?? 0;
    const originalPrice = course.originalPrice || (price > 0 ? Math.round(price * 1.5) : 0);
    const categoryName = course.category?.name || course.categoryName || '';
    const reviewsCount = course.reviews?.length ?? course.reviewsCount ?? 0;
    const totalLessons = sortedSections.reduce((a, s) => a + (s.lessons?.length || 0), 0);

    const handleEnroll = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        setIsProcessingPayment(true);
        setPaymentError(null);

        if (price > 0) {
            // Paid course: initiate payment intent
            try {
                const res = await paymentApi.createPaymentIntent(courseId);
                const clientSecret = res.data?.client_secret || res.data?.clientSecret;
                
                if (!clientSecret) {
                    throw new Error('No client secret received from server');
                }
                
                const paymentUrl = paymentApi.generatePaymobUrl(clientSecret);
                toast('Redirecting to payment... 💳', { icon: '🔒' });
                
                // Store courseId in localStorage to remember which course we were enrolling in
                localStorage.setItem('pendingEnrollmentCourseId', courseId);
                
                window.location.href = paymentUrl;
            } catch (err) {
                console.error('Payment initiation failed:', err);
                const errorMsg = err.response?.data?.message || err.message || 'Payment initiation failed';
                setPaymentError(errorMsg);
                toast.error(errorMsg);
                setIsProcessingPayment(false);
            }
        } else {
            // Free course: enroll directly
            dispatch(enrollCourse(courseId));
            toast.success('Successfully enrolled! 🎉');
            setIsProcessingPayment(false);
            navigate(`/student/courses/${courseId}`);
        }
    };

    const lessonIcon = (type) => {
        const t = typeof type === 'number' ? { 0: 'video', 1: 'pdf', 2: 'image' }[type] : type;
        switch (t) {
            case 'video': return <HiPlay className="w-4 h-4 text-primary-500" />;
            case 'pdf': return <HiDocumentText className="w-4 h-4 text-red-500" />;
            case 'image': return <HiPhotograph className="w-4 h-4 text-green-500" />;
            default: return <HiPlay className="w-4 h-4 text-gray-400" />;
        }
    };

    const tabs = ['overview', 'curriculum', 'instructor', 'reviews'];

    return (
        <div>
            <div className="bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</button>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                                {categoryName && <span className="px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-300 rounded-lg">{categoryName}</span>}
                                <span className="px-3 py-1 text-xs font-medium bg-white/10 rounded-lg">{level}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-indigo-200 mb-4 max-w-2xl">{description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1"><HiStar className="w-5 h-5 text-amber-400" /><b>{Number(rating).toFixed(1)}</b> ({reviewsCount} reviews)</span>
                                <span className="flex items-center gap-1"><HiUsers className="w-5 h-5 text-indigo-300" />{Number(studentsCount).toLocaleString()} students</span>
                                <span className="flex items-center gap-1"><HiAcademicCap className="w-5 h-5 text-indigo-300" />{totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <img src={instructorAvatar} alt={instructorName} className="w-10 h-10 rounded-full ring-2 ring-white/20" />
                                <div><p className="text-sm font-medium">{instructorName}</p><p className="text-xs text-indigo-300">Instructor</p></div>
                            </div>
                        </div>
                        <div className="bg-card rounded-2xl shadow-2xl p-6 text-text-primary h-fit">
                            <img src={thumbnail} alt={course.title} className="w-full h-44 object-cover rounded-xl mb-4" />
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-3xl font-bold text-text-primary">{price > 0 ? `$${price}` : 'Free'}</span>
                                {originalPrice > price && <span className="text-lg text-gray-400 line-through">${originalPrice}</span>}
                                {originalPrice > price && <span className="text-sm font-semibold text-emerald-500">{Math.round((1 - price / originalPrice) * 100)}% off</span>}
                            </div>
                            {isEnrolled ? (
                                <Link to={`/student/courses/${courseId}`} className="block w-full text-center py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">Continue Learning</Link>
                            ) : (
                                <>
                                    {isProcessingPayment ? (
                                        <button disabled className="w-full py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-xl cursor-not-allowed">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                Processing Payment...
                                            </div>
                                        </button>
                                    ) : (
                                        <button onClick={handleEnroll} className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all">
                                            Enroll Now
                                        </button>
                                    )}
                                    {paymentError && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                            <p className="text-sm text-red-600">{paymentError}</p>
                                            <button 
                                                onClick={() => setPaymentError(null)} 
                                                className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                            {courseQuizzes.length > 0 && (
                                <Link to={isAuthenticated ? `/student/quiz/${courseQuizzes[0].id}` : '/login'} className="block w-full text-center py-3 mt-3 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all">
                                    Take Quiz ({courseQuizzes.length} available)
                                </Link>
                            )}
                            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-500" />{totalLessons} lessons</li>
                                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-500" />{sortedSections.length} sections</li>
                                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-500" />Certificate of completion</li>
                                <li className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-500" />Lifetime access</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-1 border-b border-border mb-8">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-[1px] ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="lg:max-w-3xl">
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {longDescription && <><h2 className="text-xl font-bold text-text-primary mb-4">About This Course</h2><p className="text-sm text-text-secondary leading-relaxed mb-8">{longDescription}</p></>}
                            {course.objectives?.length > 0 && (
                                <><h2 className="text-xl font-bold text-text-primary mb-4">What you'll learn</h2>
                                <div className="grid md:grid-cols-2 gap-3 mb-8">
                                    {course.objectives.map((obj, i) => <div key={i} className="flex gap-3 p-3 bg-primary-50 rounded-xl"><HiCheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /><span className="text-sm text-text-secondary">{obj}</span></div>)}
                                </div></>
                            )}
                            {course.requirements?.length > 0 && (
                                <><h2 className="text-xl font-bold text-text-primary mb-4">Requirements</h2>
                                <ul className="space-y-2 mb-8">
                                    {course.requirements.map((req, i) => <li key={i} className="text-sm text-text-secondary flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0" />{req}</li>)}
                                </ul></>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'curriculum' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-xl font-bold text-text-primary mb-4">Course Curriculum</h2>
                            <p className="text-sm text-text-secondary mb-6">{sortedSections.length} sections • {totalLessons} lessons</p>
                            <div className="space-y-4">
                                {sortedSections.map((section) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    return (
                                        <div key={section.id} className="bg-card rounded-xl border border-border overflow-hidden">
                                            <button 
                                                onClick={() => toggleSection(section.id)} 
                                                className="w-full px-5 py-4 bg-surface font-semibold text-sm text-text-primary flex items-center justify-between hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{section.title}</span>
                                                    <span className="text-gray-400 font-normal">({section.lessons?.length || 0} lessons)</span>
                                                </div>
                                                <svg 
                                                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isExpanded && (
                                                <div className="divide-y divide-gray-50">
                                                    {(section.lessons || []).map((lesson) => (
                                                        <div key={lesson.id} className="flex items-center justify-between px-5 py-3 hover:bg-primary-50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                {lessonIcon(lesson.type)}
                                                                <span className="text-sm text-text-secondary">{lesson.title}</span>
                                                            </div>
                                                            {lesson.durationInSeconds && <span className="text-xs text-gray-400">{Math.round(lesson.durationInSeconds / 60)}m</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {sortedSections.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No curriculum available yet</p>}
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'instructor' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-6 p-6 bg-card rounded-2xl border border-border">
                            <img src={instructorAvatar} alt={instructorName} className="w-20 h-20 rounded-2xl" />
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">{instructorName}</h3>
                                <p className="text-sm text-primary-600 mb-3">Expert Instructor</p>
                                <p className="text-sm text-text-secondary leading-relaxed">Experienced professional with years of industry expertise. Passionate about teaching and helping students achieve their career goals.</p>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'reviews' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="flex items-center gap-4 mb-8 p-6 bg-card rounded-2xl border border-border">
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-text-primary">{Number(rating).toFixed(1)}</p>
                                    <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <HiStar key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}`} />)}</div>
                                    <p className="text-xs text-gray-400 mt-1">{reviewsCount} reviews</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
