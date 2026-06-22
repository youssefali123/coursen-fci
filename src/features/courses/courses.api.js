import api from "../../api/axios";

// CourseLevel enum: 0=Beginner, 1=Intermediate, 2=Advanced
export const COURSE_LEVEL = { Beginner: 0, Intermediate: 1, Advanced: 2 };

// swagger4: POST /api/Courses/create — multipart/form-data
// Fields: Thumbnail (binary), Title, Price, CategoryId, Level, ShortDescription, LongDescription
export const createCourse = (formData) =>
    api.post("/api/Courses/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// swagger4: GET /api/Courses/{courseId}/course-metadata — public course info
export const getCourseMetadata = (id) =>
    api.get(`/api/Courses/${id}/course-metadata`);

// swagger4: GET /api/Courses/{courseId}/course-data — full course content (requires auth + enrollment)
export const getCourseData = (id) =>
    api.get(`/api/Courses/${id}/course-data`);

// swagger4: GET /api/Courses — paginated list
export const getAllCourses = (pageSize = 12, pageNumber = 1) =>
    api.get("/api/Courses", {
        params: { PagedSize: pageSize, PagedNumber: pageNumber },
    });

// swagger4: GET /api/Courses/by-category/{categoryId}
export const getCoursesByCategory = (categoryId, pageSize = 12, pageNumber = 1) =>
    api.get(`/api/Courses/by-category/${categoryId}`, {
        params: { PagedSize: pageSize, PagedNumber: pageNumber },
    });

// swagger4: GET /api/Courses/by-instructor/{instructorId}
export const getCoursesByInstructor = (instructorId, pageSize = 12, pageNumber = 1) =>
    api.get(`/api/Courses/by-instructor/${instructorId}`, {
        params: { PagedSize: pageSize, PagedNumber: pageNumber },
    });

// swagger4: PUT /api/Courses/{courseId} — multipart/form-data
// Fields: Thumbnail, Title, ShortDescription, LongDescription, Level, CategoryId, Price
export const updateCourse = (courseId, formData) =>
    api.put(`/api/Courses/${courseId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// swagger4: DELETE /api/Courses/{courseId}
export const deleteCourse = (courseId) =>
    api.delete(`/api/Courses/${courseId}`);

// Backward-compat alias
export const getCourse = getCourseMetadata;
