import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CourseCatalog from './pages/public/CourseCatalog';

import CourseDetail from './pages/public/CourseDetail';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CoursePlayer from './pages/student/CoursePlayer';
import QuizPage from './pages/student/QuizPage';
import StudentProfile from './pages/student/StudentProfile';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import QuizBuilder from './pages/instructor/QuizBuilder';
import Analytics from './pages/instructor/Analytics';
import InstructorProfile from './pages/instructor/InstructorProfile';
import { Toaster } from 'react-hot-toast';
import { fetchStudentCourses, enrollCourse } from './features/coursesSlice';
import toast from 'react-hot-toast';

function PaymentHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pendingCourseId = localStorage.getItem('pendingEnrollmentCourseId');
    
    if (pendingCourseId) {
      // Check if payment was successful - Paymob usually returns success/cancel status
      const success = searchParams.get('success');
      const paymentSuccess = success === 'true' || searchParams.get('status') === 'success';
      
      if (paymentSuccess) {
        toast.success('Payment successful! 🎉');
        
        // Refresh enrolled courses to get updated state
        dispatch(fetchStudentCourses())
          .unwrap()
          .then(() => {
            // Enroll in Redux just in case
            dispatch(enrollCourse(Number(pendingCourseId)));
            // Clear pending course ID
            localStorage.removeItem('pendingEnrollmentCourseId');
            // Navigate to course content
            navigate(`/student/courses/${pendingCourseId}`);
          })
          .catch(() => {
            localStorage.removeItem('pendingEnrollmentCourseId');
          });
      } else if (success === 'false' || searchParams.get('status') === 'failed') {
        toast.error('Payment failed. Please try again.');
        localStorage.removeItem('pendingEnrollmentCourseId');
      }
    }
  }, [location, navigate, dispatch]);
  
  return null;
}

function App() {
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <PaymentHandler />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e1b4b', color: '#fff', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="courses" element={<CourseCatalog />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          {/* Redirect already-logged-in users away from login/register */}
          <Route
            path="login"
            element={
              isAuthenticated
                ? <Navigate to={user?.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'} replace />
                : <Login />
            }
          />
          <Route
            path="register"
            element={
              isAuthenticated
                ? <Navigate to={user?.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'} replace />
                : <Register />
            }
          />
          <Route path="forgot-password" element={<Navigate to="/login" replace />} />
          <Route path="reset-password" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Student Routes — requires authentication */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/:id" element={<CoursePlayer />} />
          <Route path="quiz/:id" element={<QuizPage />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Instructor Routes — requires authentication */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute role="instructor">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="courses/new" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<EditCourse />} />
          <Route path="quiz/new" element={<QuizBuilder />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<InstructorProfile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
