import api from "../../api/axios";

// swagger2: URL changed from /dashboard to /statistics
export const getStatistics = () =>
    api.get("/api/Instructor/statistics");

// Backward-compat alias used by instructorSlice
export const getDashboard = getStatistics;

export const getCourses = () =>
    api.get("/api/Instructor/courses");

// swagger2: URL changed from /{id}/dashboard to /{id}/profile
export const getInstructorProfile = (instructorId) =>
    api.get(`/api/Instructor/${instructorId}/profile`);

export const getRecentActivity = (count = 4) =>
    api.get("/api/Instructor/recent-activity", { params: { count } });

// swagger2: NEW — PUT /api/Instructor/edit-profile (multipart/form-data)
// Fields: Name, Email, Title, AboutMe, Bio, Image (binary)
export const editProfile = (formData) =>
    api.put("/api/Instructor/edit-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });