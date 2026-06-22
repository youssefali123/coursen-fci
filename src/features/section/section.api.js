import api from "../../api/axios";

// swagger4: POST /api/Section/course/{courseId}/create — CreateSectionDto { title, order }
// courseId is a PATH PARAMETER, not in the body
export const createSection = (courseId, data) =>
    api.post(`/api/Section/course/${courseId}/create`, data);

// swagger4: GET /api/Section/{sectionId}
export const getSection = (sectionId) =>
    api.get(`/api/Section/${sectionId}`);

// swagger4: GET /api/Section/{courseId}/sections-with-lessons
export const getSectionsWithLessons = (courseId) =>
    // api.get(`/api/Section/${courseId}/sections-with-lessons`);
    api.get(`/api/Courses/${courseId}/course-data`)

// swagger4: PUT /api/Section/update/{sectionId} — UpdateSectionDto { title, order }
export const updateSection = (sectionId, data) =>
    api.put(`/api/Section/update/${sectionId}`, data);

// swagger4: DELETE /api/Section/delete/{sectionId}
export const deleteSection = (sectionId) =>
    api.delete(`/api/Section/delete/${sectionId}`);
