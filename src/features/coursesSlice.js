import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as coursesApi from './courses/courses.api';
import * as instructorApi from './instructor/instructor.api';
import * as studentsApi from './students/students.api';
import * as sectionApi from './section/section.api';
import * as lessonApi from './lesson/lesson.api';

const initialState = {
    courses: [],
    enrolledCourses: [],
    currentCourse: null,
    currentCourseData: null,
    sections: [],
    lessonDetails: null,
    loadingLessonDetails: false,
    completedLessons: {},
    searchQuery: '',
    selectedCategory: null,
    selectedLevel: null,
    sortBy: 'popular',
    currentPage: 1,
    totalPages: 1,
    pageSize: 12,
    loading: false,
    error: null,
};

export const fetchAllCourses = createAsyncThunk('courses/fetchAll',
    async ({ pageSize = 12, pageNumber = 1 } = {}, { rejectWithValue }) => {
        try { const res = await coursesApi.getAllCourses(pageSize, pageNumber); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load courses'); }
    }
);

export const fetchCoursesByCategory = createAsyncThunk('courses/fetchByCategory',
    async ({ categoryId, pageSize = 12, pageNumber = 1 }, { rejectWithValue }) => {
        try { const res = await coursesApi.getCoursesByCategory(categoryId, pageSize, pageNumber); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load courses'); }
    }
);

export const fetchInstructorCourses = createAsyncThunk('courses/fetchInstructorCourses',
    async (_, { rejectWithValue }) => {
        try { const res = await instructorApi.getCourses(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load courses'); }
    }
);

export const fetchStudentCourses = createAsyncThunk('courses/fetchStudentCourses',
    async (_, { rejectWithValue }) => {
        try { const res = await studentsApi.getCourses(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load courses'); }
    }
);

export const fetchCourseById = createAsyncThunk('courses/fetchById',
    async (id, { rejectWithValue }) => {
        try { const res = await coursesApi.getCourseMetadata(id); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load course'); }
    }
);

// swagger4: GET /api/Courses/{courseId}/course-data — unified endpoint for enrolled course content
export const fetchCourseData = createAsyncThunk('courses/fetchCourseData',
    async (id, { rejectWithValue }) => {
        try { const res = await coursesApi.getCourseData(id); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load course data'); }
    }
);

// swagger4: GET /api/Lesson/course/{courseId}/lesson/{lessonId} — get full lesson details with fileUrl
export const fetchLessonDetails = createAsyncThunk(
    'courses/fetchLessonDetails',
    async ({ courseId, lessonId }, { rejectWithValue }) => {
        try {
            const res = await lessonApi.getLesson(courseId, lessonId);
            // Handle backend typo: leesonId vs lessonId
            const data = {
                ...res.data,
                lessonId: res.data.lessonId || res.data.leesonId,
                fileUrl: res.data.fileUrl ? res.data.fileUrl.trim().replace(/`/g, '') : null
            };
            return data;
        }
        catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load lesson details');
        }
    }
);

export const fetchSectionsWithLessons = createAsyncThunk('courses/fetchSectionsWithLessons',
    async (courseId, { rejectWithValue }) => {
        try { const res = await sectionApi.getSectionsWithLessons(courseId); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load sections'); }
    }
);

export const createCourseThunk = createAsyncThunk('courses/create',
    async ({ courseData, thumbnailFile }, { rejectWithValue }) => {
        try {
            const fd = new FormData();
            fd.append('Title', courseData.title);
            if (courseData.shortDescription) fd.append('ShortDescription', courseData.shortDescription);
            if (courseData.longDescription) fd.append('LongDescription', courseData.longDescription);
            fd.append('CategoryId', courseData.categoryId);
            fd.append('Level', courseData.level);
            fd.append('Price', courseData.price || 0);
            if (thumbnailFile) fd.append('Thumbnail', thumbnailFile);
            const createRes = await coursesApi.createCourse(fd);
            return createRes.data;
        } catch (err) {
            const data = err.response?.data;
            let message = 'Failed to create course';
            if (data) {
                if (typeof data === 'string') message = data;
                else if (data.message) message = data.message;
                else if (data.errors) { message = data.errors[Object.keys(data.errors)[0]]?.[0] || message; }
                else if (data.title) message = data.title;
            }
            return rejectWithValue(message);
        }
    }
);

// Legacy aliases kept for any remaining references — they now redirect to fetchCourseData
export const fetchPaidCourse = fetchCourseData;
export const fetchEnrolledCourse = fetchCourseData;

export const updateCourseThunk = createAsyncThunk('courses/update',
    async ({ courseId, courseData, thumbnailFile }, { rejectWithValue }) => {
        try {
            const fd = new FormData();
            if (courseData.title) fd.append('Title', courseData.title);
            if (courseData.shortDescription !== undefined) fd.append('ShortDescription', courseData.shortDescription);
            if (courseData.longDescription !== undefined) fd.append('LongDescription', courseData.longDescription);
            if (courseData.level !== undefined) fd.append('Level', courseData.level);
            if (courseData.categoryId !== undefined) fd.append('CategoryId', courseData.categoryId);
            if (courseData.price !== undefined) fd.append('Price', courseData.price);
            if (thumbnailFile) fd.append('Thumbnail', thumbnailFile);
            const res = await coursesApi.updateCourse(courseId, fd);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update course');
        }
    }
);

export const deleteCourseThunk = createAsyncThunk('courses/delete',
    async (courseId, { rejectWithValue }) => {
        try { await coursesApi.deleteCourse(courseId); return courseId; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete course'); }
    }
);

const coursesSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setCourses: (state, action) => { state.courses = action.payload; },
        addCourse: (state, action) => { state.courses.push(action.payload); },
        updateCourse: (state, action) => { const i = state.courses.findIndex((c) => c.id === action.payload.id); if (i !== -1) state.courses[i] = action.payload; },
        deleteCourse: (state, action) => { state.courses = state.courses.filter((c) => c.id !== action.payload); },
        setEnrolledCourses: (state, action) => { state.enrolledCourses = action.payload; },
        enrollCourse: (state, action) => { if (!state.enrolledCourses.includes(action.payload)) { state.enrolledCourses.push(action.payload); state.completedLessons[action.payload] = []; } },
        unenrollCourse: (state, action) => { state.enrolledCourses = state.enrolledCourses.filter((id) => id !== action.payload); delete state.completedLessons[action.payload]; },
        completeLesson: (state, action) => { const { courseId, lessonId } = action.payload; if (!state.completedLessons[courseId]) state.completedLessons[courseId] = []; if (!state.completedLessons[courseId].includes(lessonId)) { state.completedLessons[courseId].push(lessonId); } },
        setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
        setSelectedCategory: (state, action) => { state.selectedCategory = action.payload; },
        setSelectedLevel: (state, action) => { state.selectedLevel = action.payload; },
        setSortBy: (state, action) => { state.sortBy = action.payload; },
        setLoading: (state, action) => { state.loading = action.payload; },
        setCurrentPage: (state, action) => { state.currentPage = action.payload; },
        clearError: (state) => { state.error = null; },
        clearCurrentCourse: (state) => { state.currentCourse = null; state.currentCourseData = null; state.sections = []; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCourses.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchAllCourses.fulfilled, (s, a) => { s.loading = false; const p = a.payload; if (p && Array.isArray(p.items || p)) { s.courses = p.items || p; s.totalPages = p.totalPages || 1; s.currentPage = p.currentPage || 1; } })
            .addCase(fetchAllCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(fetchCoursesByCategory.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchCoursesByCategory.fulfilled, (s, a) => { s.loading = false; const p = a.payload; if (p && Array.isArray(p.items || p)) { s.courses = p.items || p; s.totalPages = p.totalPages || 1; s.currentPage = p.currentPage || 1; } })
            .addCase(fetchCoursesByCategory.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(fetchInstructorCourses.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchInstructorCourses.fulfilled, (s, a) => { s.loading = false; if (Array.isArray(a.payload)) s.courses = a.payload; })
            .addCase(fetchInstructorCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(fetchStudentCourses.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchStudentCourses.fulfilled, (s, a) => { s.loading = false; const data = a.payload; if (Array.isArray(data)) { s.enrolledCourses = data.map((c) => c.id || c.courseId); data.forEach((c) => { if (!s.courses.find((e) => e.id === (c.id || c.courseId))) s.courses.push(c); }); } })
            .addCase(fetchStudentCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(fetchCourseById.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchCourseById.fulfilled, (s, a) => {
                s.loading = false;
                s.currentCourse = a.payload;
                if (a.payload?.sections) {
                    s.sections = a.payload.sections;
                }
            })
            .addCase(fetchCourseById.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(fetchCourseData.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchCourseData.fulfilled, (s, a) => {
                s.loading = false;
                s.currentCourseData = a.payload;
                s.sections = a.payload?.sections || [];
                // Also add to currentCourse if not present
                if (!s.currentCourse || s.currentCourse.id !== a.payload?.id) {
                    s.currentCourse = a.payload;
                }
            })
            .addCase(fetchCourseData.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

        builder
            .addCase(fetchLessonDetails.pending, (s) => {
                s.loadingLessonDetails = true;
                s.error = null;
            })
            .addCase(fetchLessonDetails.fulfilled, (s, a) => {
                s.loadingLessonDetails = false;
                s.lessonDetails = a.payload;
            })
            .addCase(fetchLessonDetails.rejected, (s, a) => {
                s.loadingLessonDetails = false;
                s.error = a.payload;
            });
        builder
            .addCase(fetchSectionsWithLessons.pending, (s) => { s.loading = true; })
            .addCase(fetchSectionsWithLessons.fulfilled, (s, a) => {
                s.loading = false;
                // Handle both a bare array (original endpoint) and a course-data object ({ sections: [...] })
                if (Array.isArray(a.payload)) {
                    s.sections = a.payload;
                } else if (a.payload?.sections && Array.isArray(a.payload.sections)) {
                    s.sections = a.payload.sections;
                } else {
                    s.sections = [];
                }
            })
            .addCase(fetchSectionsWithLessons.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(createCourseThunk.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(createCourseThunk.fulfilled, (s, a) => { s.loading = false; if (a.payload) s.courses.push(a.payload); })
            .addCase(createCourseThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(updateCourseThunk.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(updateCourseThunk.fulfilled, (s, a) => { s.loading = false; if (a.payload) { const i = s.courses.findIndex((c) => c.id === a.payload.id); if (i !== -1) s.courses[i] = a.payload; } })
            .addCase(updateCourseThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(deleteCourseThunk.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(deleteCourseThunk.fulfilled, (s, a) => { s.loading = false; s.courses = s.courses.filter((c) => c.id !== a.payload); })
            .addCase(deleteCourseThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    },
});

export const {
    setCourses, addCourse, updateCourse, deleteCourse, setEnrolledCourses,
    enrollCourse, unenrollCourse, completeLesson, setSearchQuery,
    setSelectedCategory, setSelectedLevel, setSortBy, setLoading, setCurrentPage,
    clearError, clearCurrentCourse,
} = coursesSlice.actions;

export default coursesSlice.reducer;
