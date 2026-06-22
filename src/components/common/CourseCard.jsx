import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar, HiUsers, HiClock, HiPlay } from 'react-icons/hi';

const LEVEL_LABELS = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' };

const CourseCard = ({ course, index = 0 }) => {
    const level = typeof course.level === 'number' ? LEVEL_LABELS[course.level] || 'Beginner' : (course.level || 'Beginner');
    const thumbnail = course.thumbnail || 'https://placehold.co/400x250?text=Course';
    const rating = course.rate ?? course.rating ?? 0;
    const studentsCount = course.enrollments?.length ?? course.studentsCount ?? 0;
    const instructorName = course.user?.name || course.instructorName || 'Instructor';
    const instructorAvatar = course.user?.pathOfImage || course.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructorName}`;
    const categoryName = course.category?.name || course.category || '';
    const price = course.price ?? 0;
    const description = course.shortDescription || course.description || '';
    const reviewsCount = course.reviews?.length ?? course.reviewsCount ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-border transition-shadow duration-300"
        >
            <Link to={`/courses/${course.id}`}>
                <div className="relative overflow-hidden">
                    <img src={thumbnail} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <HiPlay className="w-6 h-6 text-primary-600 ml-1" />
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 flex gap-2">
                        {course.isBestseller && <span className="px-2.5 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded-lg">Bestseller</span>}
                        <span className="px-2.5 py-1 text-xs font-medium bg-white/90 text-text-secondary rounded-lg backdrop-blur-sm">{level}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className="px-3 py-1.5 text-sm font-bold bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-600/30">
                            {price > 0 ? `$${price}` : 'Free'}
                        </span>
                    </div>
                </div>
                <div className="p-5">
                    {categoryName && (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{categoryName}</span>
                        </div>
                    )}
                    <h3 className="text-base font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">{course.title}</h3>
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{description}</p>
                    <div className="flex items-center gap-2 mb-3">
                        <img src={instructorAvatar} alt={instructorName} className="w-6 h-6 rounded-full" />
                        <span className="text-xs text-text-secondary">{instructorName}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1">
                            <HiStar className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-semibold text-text-secondary">{Number(rating).toFixed(1)}</span>
                            {reviewsCount > 0 && <span className="text-xs text-gray-400">({reviewsCount})</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <HiUsers className="w-3.5 h-3.5" />{Number(studentsCount).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCard;
