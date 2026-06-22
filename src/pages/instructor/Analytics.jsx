import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiUsers, HiStar, HiBookOpen } from 'react-icons/hi';
import StatsCard from '../../components/common/StatsCard';
import { fetchInstructorDashboard } from '../../features/instructorSlice';
import { fetchInstructorCourses } from '../../features/coursesSlice';

const Analytics = () => {
    const dispatch = useDispatch();
    const { courses, loading } = useSelector((s) => s.courses);
    const { dashboard } = useSelector((s) => s.instructor);

    useEffect(() => {
        dispatch(fetchInstructorDashboard());
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    const totalStudents = dashboard?.totalStudents ?? courses.reduce((a, c) => a + (c.enrollments?.length ?? c.studentsCount ?? 0), 0);
    const avgRating = dashboard?.averageRating ?? (courses.length > 0 ? (courses.reduce((a, c) => a + (c.rate ?? c.rating ?? 0), 0) / courses.length).toFixed(1) : 0);
    const totalCourses = dashboard?.totalCourses ?? courses.length;
    const totalRevenue = dashboard?.totalRevenue ?? courses.reduce((a, c) => a + ((c.price ?? 0) * (c.enrollments?.length ?? c.studentsCount ?? 0)), 0);

    const sortedCourses = [...courses].sort((a, b) => (b.enrollments?.length ?? b.studentsCount ?? 0) - (a.enrollments?.length ?? a.studentsCount ?? 0));

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Course <span className="gradient-text">Analytics</span></h1>
                <p className="text-text-secondary text-sm mt-1">Track your teaching performance</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard icon={HiUsers} label="Total Students" value={Number(totalStudents).toLocaleString()} color="primary" trend={12} index={0} />
                <StatsCard icon={HiBookOpen} label="Active Courses" value={totalCourses} color="green" index={1} />
                <StatsCard icon={HiStar} label="Avg Rating" value={Number(avgRating).toFixed(1)} color="orange" index={2} />
                <StatsCard icon={HiTrendingUp} label="Total Revenue" value={`$${(Number(totalRevenue) / 1000).toFixed(1)}K`} color="purple" trend={5} index={3} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Courses */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Top Courses</h3>
                    <div className="space-y-4">
                        {sortedCourses.slice(0, 5).map((course, i) => {
                            const students = course.enrollments?.length ?? course.studentsCount ?? 0;
                            const rating = course.rate ?? course.rating ?? 0;
                            return (
                                <div key={course.id} className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-text-secondary' : 'bg-orange-50 text-orange-500'}`}>{i + 1}</span>
                                    <img src={course.thumbnail || 'https://placehold.co/48x40?text=C'} alt={course.title} className="w-12 h-10 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{course.title}</p>
                                        <p className="text-xs text-gray-400">{students} students</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        <HiStar className="w-4 h-4 text-amber-400" />
                                        <span className="font-semibold text-text-secondary">{Number(rating).toFixed(1)}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {sortedCourses.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No courses yet</p>}
                    </div>
                </motion.div>

                {/* Revenue by Course */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                        {sortedCourses.slice(0, 5).map((course) => {
                            const students = course.enrollments?.length ?? course.studentsCount ?? 0;
                            const revenue = (course.price ?? 0) * students;
                            const maxRev = Math.max(...courses.map((c) => (c.price ?? 0) * (c.enrollments?.length ?? c.studentsCount ?? 0))) || 1;
                            return (
                                <div key={course.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-text-secondary truncate max-w-[60%]">{course.title}</span>
                                        <span className="text-sm font-semibold text-text-primary">${revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(revenue / maxRev) * 100}%` }} transition={{ duration: 0.8 }}
                                            className="bg-gradient-to-r from-primary-500 to-primary-300 h-2 rounded-full" />
                                    </div>
                                </div>
                            );
                        })}
                        {courses.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No revenue data</p>}
                    </div>
                </motion.div>
            </div>

            {/* Course Performance Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border border-border p-6 mt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Course Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-text-secondary border-b border-border">
                            <th className="pb-3 font-medium">Course</th><th className="pb-3 font-medium">Students</th><th className="pb-3 font-medium">Rating</th><th className="pb-3 font-medium">Revenue</th>
                        </tr></thead>
                        <tbody>
                            {courses.map((c) => {
                                const students = c.enrollments?.length ?? c.studentsCount ?? 0;
                                const rating = c.rate ?? c.rating ?? 0;
                                return (
                                    <tr key={c.id} className="border-b border-gray-50">
                                        <td className="py-3 font-medium text-text-primary">{c.title}</td>
                                        <td className="py-3 text-text-secondary">{Number(students).toLocaleString()}</td>
                                        <td className="py-3"><span className="flex items-center gap-1"><HiStar className="w-3.5 h-3.5 text-amber-400" />{Number(rating).toFixed(1)}</span></td>
                                        <td className="py-3 text-text-secondary">${((c.price ?? 0) * students).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {courses.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No courses to display</p>}
                </div>
            </motion.div>
        </div>
    );
};

export default Analytics;
