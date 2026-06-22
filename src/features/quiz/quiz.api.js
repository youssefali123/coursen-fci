import api from "../../api/axios";

// QuizType enum: 0=MultipleChoice, 1=TrueFalse

// swagger3: POST /api/Quiz/create — QuizDto JSON body
export const createQuiz = (data) =>
    api.post("/api/Quiz/create", data);

// swagger3: GET /api/Quiz/{id}/metadata — returns Quiz schema
export const getQuizMetadata = (id) =>
    api.get(`/api/Quiz/${id}/metadata`);

// swagger3: GET /api/Quiz/{id}/quiz-data — returns full quiz data for taking
export const getQuizData = (id) =>
    api.get(`/api/Quiz/${id}/quiz-data`);

// swagger3: POST /api/Quiz/{id}/submit — QuizSubmitDto { answers: [{ questionId, selectedAnswer }] }
export const submitQuiz = (id, data) =>
    api.post(`/api/Quiz/${id}/submit`, data);

// swagger3: GET /api/Quiz/{id}/my-result
export const getMyResult = (id) =>
    api.get(`/api/Quiz/${id}/my-result`);

// swagger3: GET /api/Quiz/{id}/all-results (instructor view)
export const getAllResults = (id) =>
    api.get(`/api/Quiz/${id}/all-results`);

// swagger3: GET /api/Quiz/course/{courseId}/quizzes
export const getQuizzesByCourse = (courseId) =>
    api.get(`/api/Quiz/course/${courseId}/quizzes`);

// swagger3: PUT /api/Quiz/{quizId}/update-quiz-metadata — QuizDto body
export const updateQuizMetadata = (quizId, data) =>
    api.put(`/api/Quiz/${quizId}/update-quiz-metadata`, data);

// swagger3: PUT /api/Quiz/course/{courseId}/quiz/{quizId}/update-quiz-data — UpdateQuizDto body
export const updateQuizData = (courseId, quizId, data) =>
    api.put(`/api/Quiz/course/${courseId}/quiz/${quizId}/update-quiz-data`, data);

// swagger3: DELETE /api/Quiz/{quizId}/delete
export const deleteQuiz = (quizId) =>
    api.delete(`/api/Quiz/${quizId}/delete`);

// Backward-compat alias
export const getQuiz = getQuizMetadata;
