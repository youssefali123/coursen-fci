import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiPlay, HiUsers, HiAcademicCap, HiStar, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import CourseCard from '../../components/common/CourseCard';
import { fetchAllCourses } from '../../features/coursesSlice';
import { categories } from '../../data/categories';

const Landing = () => {
    const dispatch = useDispatch();
    const { courses } = useSelector((s) => s.courses);

    useEffect(() => {
        dispatch(fetchAllCourses({ pageSize: 8, pageNumber: 1 }));
    }, [dispatch]);

    const featuredCourses = courses.slice(0, 4);

    const stats = [
        { icon: HiUsers, value: '50K+', label: 'Active Students' },
        { icon: HiAcademicCap, value: '200+', label: 'Expert Courses' },
        { icon: HiStar, value: '4.8', label: 'Average Rating' },
        { icon: HiCheckCircle, value: '95%', label: 'Completion Rate' },
    ];

    const testimonials = [
        {
            name: 'Alex Rivera',
            role: 'Frontend Developer',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            text: 'EduFlow completely transformed my career. The courses are well-structured and the instructors are amazing!',
            rating: 5,
        },
        {
            name: 'Priya Sharma',
            role: 'Data Scientist',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
            text: 'The Python for Data Science course helped me land my dream job. Highly recommend this platform!',
            rating: 5,
        },
        {
            name: 'David Chen',
            role: 'DevOps Engineer',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            text: 'Best learning platform I\'ve used. The quiz system really helps reinforce what you learn.',
            rating: 4,
        },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900 text-white">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="inline-block px-4 py-1.5 text-sm font-medium bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                                🚀 Start your learning journey today
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                Learn Without{' '}
                                <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                                    Limits
                                </span>
                            </h1>
                            <p className="text-lg text-indigo-200 mb-8 max-w-lg leading-relaxed">
                                Access world-class courses from expert instructors. Build real skills with hands-on projects, quizzes, and certificates.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-card text-primary-700 font-semibold rounded-xl hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5"
                                >
                                    Explore Courses
                                    <HiArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <HiPlay className="w-5 h-5" />
                                    Watch Demo
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                                    <img
                                        // src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
                                        src="https://i.postimg.cc/cCL71xx7/Chat-GPT-Image-Jun-19-2026-10-25-25-AM.png"
                                        alt="Students learning"
                                        className="rounded-2xl w-full shadow-2xl"
                                    />
                                </div>
                                {/* Floating card */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -bottom-4 -left-8 bg-card rounded-xl p-4 shadow-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <HiCheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">Course Completed!</p>
                                            <p className="text-xs text-text-secondary">React Developer Path</p>
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Stats floating card */}
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -top-4 -right-8 bg-card rounded-xl p-4 shadow-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <HiStar className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">4.9 Rating</p>
                                            <p className="text-xs text-text-secondary">From 2K+ reviews</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <stat.icon className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                                <p className="text-sm text-indigo-200">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Browse by <span className="gradient-text">Category</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Explore our wide range of categories and find the perfect course for your career goals.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/courses?category=${cat.id}`}
                                    className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary group-hover:text-primary-700 transition-colors">{cat.name}</p>
                                        <p className="text-xs text-gray-400">{cat.count} courses</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-primary-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-12"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                Featured <span className="gradient-text">Courses</span>
                            </h2>
                            <p className="text-text-secondary max-w-lg">
                                Hand-picked courses from our top-rated instructors to help you achieve your goals.
                            </p>
                        </div>
                        <Link
                            to="/courses"
                            className="mt-4 md:mt-0 inline-flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                        >
                            View All Courses <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredCourses.map((course, i) => (
                            <CourseCard key={course.id} course={course} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            What Our <span className="gradient-text">Students</span> Say
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Join thousands of satisfied learners who have transformed their careers with EduFlow.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <HiStar key={j} className={`w-5 h-5 ${j < t.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <p className="text-text-secondary mb-4 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                                        <p className="text-xs text-text-secondary">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 p-10 md:p-16 text-center text-white"
                    >
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Start Learning?
                            </h2>
                            <p className="text-indigo-200 max-w-xl mx-auto mb-8">
                                Join over 50,000 students already learning on EduFlow. Get unlimited access to all courses.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-primary-700 font-semibold rounded-xl hover:bg-primary-100 dark:bg-primary-900/40 dark:hover:bg-primary-900/30 transition-all shadow-xl hover:-translate-y-0.5"
                                >
                                    Get Started Free
                                    <HiArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

