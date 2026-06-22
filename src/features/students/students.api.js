import api from "../../api/axios";

// swagger3: All student endpoints use JWT token — no studentId param needed

// swagger3: GET /api/Students/profile
export const getProfile = () =>
    api.get("/api/Students/profile");

// swagger3: GET /api/Students/dashboard
export const getDashboard = () =>
    api.get("/api/Students/dashboard");

// swagger3: GET /api/Students/my-courses
export const getCourses = () =>
    api.get("/api/Students/my-courses");

// swagger4: PUT /api/Students/edit-profile
export const editProfile = (queryParams, formData) =>
    api.put("/api/Students/edit-profile", formData, {
        params: queryParams,
        headers: { "Content-Type": "multipart/form-data" },
    });