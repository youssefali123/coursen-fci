import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as quizApi from './quiz/quiz.api';

const initialState = {
    currentQuiz: null,
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    isSubmitted: false,
    score: null,
    quizResult: null,
    courseQuizzes: [],
    quizHistory: [],
    quizLoading: false,
    quizError: null,
};

export const createQuizThunk = createAsyncThunk('quiz/create',
    async (quizData, { rejectWithValue }) => {
        try { const res = await quizApi.createQuiz(quizData); return res.data; }
        catch (err) {
            const data = err.response?.data;
            let message = 'Failed to create quiz';
            if (data) { if (typeof data === 'string') message = data; else if (data.message) message = data.message; else if (data.title) message = data.title; }
            return rejectWithValue(message);
        }
    }
);

export const fetchQuizThunk = createAsyncThunk('quiz/fetch',
    async (id, { rejectWithValue }) => {
        try { const res = await quizApi.getQuizMetadata(id); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load quiz'); }
    }
);

export const fetchQuizDataThunk = createAsyncThunk('quiz/fetchData',
    async (id, { rejectWithValue }) => {
        try { const res = await quizApi.getQuizData(id); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load quiz data'); }
    }
);

export const submitQuizThunk = createAsyncThunk('quiz/submit',
    async ({ quizId, answers }, { rejectWithValue }) => {
        try { const res = await quizApi.submitQuiz(quizId, { answers }); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to submit quiz'); }
    }
);

export const fetchMyResultThunk = createAsyncThunk('quiz/myResult',
    async (quizId, { rejectWithValue }) => {
        try { const res = await quizApi.getMyResult(quizId); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load result'); }
    }
);

export const fetchAllResultsThunk = createAsyncThunk('quiz/allResults',
    async (quizId, { rejectWithValue }) => {
        try { const res = await quizApi.getAllResults(quizId); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load results'); }
    }
);

export const fetchQuizzesByCourseThunk = createAsyncThunk('quiz/byCourse',
    async (courseId, { rejectWithValue }) => {
        try { const res = await quizApi.getQuizzesByCourse(courseId); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load quizzes'); }
    }
);

export const updateQuizMetadataThunk = createAsyncThunk('quiz/updateMeta',
    async ({ quizId, data }, { rejectWithValue }) => {
        try { const res = await quizApi.updateQuizMetadata(quizId, data); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update quiz'); }
    }
);

export const updateQuizDataThunk = createAsyncThunk('quiz/updateData',
    async ({ courseId, quizId, data }, { rejectWithValue }) => {
        try { const res = await quizApi.updateQuizData(courseId, quizId, data); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update quiz'); }
    }
);

export const deleteQuizThunk = createAsyncThunk('quiz/delete',
    async (quizId, { rejectWithValue }) => {
        try { await quizApi.deleteQuiz(quizId); return quizId; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete quiz'); }
    }
);

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        startQuiz: (state, action) => {
            state.currentQuiz = action.payload;
            state.currentQuestionIndex = 0;
            state.answers = {};
            state.timeRemaining = (action.payload.timeLimitInMinutes || action.payload.timeLimit || 15) * 60;
            state.isSubmitted = false;
            state.score = null;
            state.quizResult = null;
        },
        setAnswer: (state, action) => {
            const { questionId, answerIndex } = action.payload;
            state.answers[questionId] = answerIndex;
        },
        nextQuestion: (state) => { if (state.currentQuiz && state.currentQuestionIndex < state.currentQuiz.questions.length - 1) state.currentQuestionIndex += 1; },
        prevQuestion: (state) => { if (state.currentQuestionIndex > 0) state.currentQuestionIndex -= 1; },
        goToQuestion: (state, action) => { state.currentQuestionIndex = action.payload; },
        decrementTimer: (state) => { if (state.timeRemaining > 0) state.timeRemaining -= 1; },
        submitQuizLocal: (state) => {
            if (!state.currentQuiz) return;
            state.isSubmitted = true;
        },
        resetQuiz: (state) => {
            state.currentQuiz = null;
            state.currentQuestionIndex = 0;
            state.answers = {};
            state.timeRemaining = 0;
            state.isSubmitted = false;
            state.score = null;
            state.quizResult = null;
            state.quizError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createQuizThunk.pending, (s) => { s.quizLoading = true; s.quizError = null; })
            .addCase(createQuizThunk.fulfilled, (s) => { s.quizLoading = false; })
            .addCase(createQuizThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
        builder
            .addCase(fetchQuizThunk.pending, (s) => { s.quizLoading = true; s.quizError = null; })
            .addCase(fetchQuizThunk.fulfilled, (s, a) => { s.quizLoading = false; s.currentQuiz = a.payload; })
            .addCase(fetchQuizThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
        builder
            .addCase(fetchQuizDataThunk.pending, (s) => { s.quizLoading = true; })
            .addCase(fetchQuizDataThunk.fulfilled, (s, a) => { s.quizLoading = false; s.currentQuiz = a.payload; })
            .addCase(fetchQuizDataThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
        builder
            .addCase(submitQuizThunk.pending, (s) => { s.quizLoading = true; })
            .addCase(submitQuizThunk.fulfilled, (s, a) => { s.quizLoading = false; s.isSubmitted = true; s.quizResult = a.payload; })
            .addCase(submitQuizThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
        builder
            .addCase(fetchMyResultThunk.pending, (s) => { s.quizLoading = true; })
            .addCase(fetchMyResultThunk.fulfilled, (s, a) => { s.quizLoading = false; s.quizResult = a.payload; })
            .addCase(fetchMyResultThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
        builder
            .addCase(fetchQuizzesByCourseThunk.pending, (s) => { s.quizLoading = true; })
            .addCase(fetchQuizzesByCourseThunk.fulfilled, (s, a) => { s.quizLoading = false; s.courseQuizzes = Array.isArray(a.payload) ? a.payload : []; })
            .addCase(fetchQuizzesByCourseThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
        builder
            .addCase(deleteQuizThunk.pending, (s) => { s.quizLoading = true; })
            .addCase(deleteQuizThunk.fulfilled, (s, a) => { s.quizLoading = false; s.courseQuizzes = s.courseQuizzes.filter((q) => q.id !== a.payload); })
            .addCase(deleteQuizThunk.rejected, (s, a) => { s.quizLoading = false; s.quizError = a.payload; });
    },
});

export const { startQuiz, setAnswer, nextQuestion, prevQuestion, goToQuestion, decrementTimer, submitQuizLocal, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
