import api from "../../api/axios";

// FileType enum: 0=Video, 1=PDF, 2=Image
export const FILE_TYPE = { Video: 0, PDF: 1, Image: 2 };

// swagger4: POST /api/Lesson/{courseId}/section/{sectionId}/create — multipart/form-data
// courseId and sectionId are PATH PARAMETERS. FormData fields: File (binary), Title, Order, Type (FileType), DurationInSeconds
export const createLesson = (courseId, sectionId, formData) =>
    api.post(`/api/Lesson/${courseId}/section/${sectionId}/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// swagger4: GET /api/Lesson/course/{courseId}/lesson/{lessonId}
export const getLesson = (courseId, lessonId) =>
    api.get(`/api/Lesson/course/${courseId}/lesson/${lessonId}`);

// swagger4: GET /api/Lesson/lessons-per-section/{sectionId}
export const getLessonsBySection = (sectionId) =>
    api.get(`/api/Lesson/lessons-per-section/${sectionId}`);

// swagger4: PUT /api/Lesson/update — multipart/form-data
// Fields: Id, SectionId, File (binary), Title, Order, Type (FileType), DurationInSeconds
export const updateLesson = (formData) =>
    api.put("/api/Lesson/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// swagger4: DELETE /api/Lesson/delete/{id}
export const deleteLesson = (id) =>
    api.delete(`/api/Lesson/delete/${id}`);