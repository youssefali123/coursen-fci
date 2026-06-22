import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sectionApi from './section/section.api';
import * as lessonApi from './lesson/lesson.api';

const initialState = {
    sections: [],
    loading: false,
    error: null,
};

// swagger4: courseId is now a PATH PARAM — pass { courseId, title, order }
export const createSectionThunk = createAsyncThunk('section/create',
    async ({ courseId, title, order }, { rejectWithValue }) => {
        try {
            const res = await sectionApi.createSection(courseId, { title, order });
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create section'); }
    }
);

export const updateSectionThunk = createAsyncThunk('section/update',
    async ({ sectionId, data }, { rejectWithValue }) => {
        try { const res = await sectionApi.updateSection(sectionId, data); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update section'); }
    }
);

export const deleteSectionThunk = createAsyncThunk('section/delete',
    async (sectionId, { rejectWithValue }) => {
        try { await sectionApi.deleteSection(sectionId); return sectionId; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete section'); }
    }
);

// swagger4: courseId and sectionId are now PATH PARAMs — pass { courseId, sectionId, formData }
export const createLessonThunk = createAsyncThunk('section/createLesson',
    async ({ courseId, sectionId, formData }, { rejectWithValue }) => {
        try {
            const res = await lessonApi.createLesson(courseId, sectionId, formData);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create lesson'); }
    }
);

export const updateLessonThunk = createAsyncThunk('section/updateLesson',
    async (formData, { rejectWithValue }) => {
        try { const res = await lessonApi.updateLesson(formData); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update lesson'); }
    }
);

export const deleteLessonThunk = createAsyncThunk('section/deleteLesson',
    async (lessonId, { rejectWithValue }) => {
        try { await lessonApi.deleteLesson(lessonId); return lessonId; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete lesson'); }
    }
);

const sectionSlice = createSlice({
    name: 'section',
    initialState,
    reducers: {
        clearSectionError: (s) => { s.error = null; },
        setSections: (s, a) => { s.sections = a.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createSectionThunk.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(createSectionThunk.fulfilled, (s, a) => { s.loading = false; if (a.payload) s.sections.push(a.payload); })
            .addCase(createSectionThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(updateSectionThunk.pending, (s) => { s.loading = true; })
            .addCase(updateSectionThunk.fulfilled, (s, a) => { s.loading = false; if (a.payload) { const i = s.sections.findIndex((sec) => sec.id === a.payload.id); if (i !== -1) s.sections[i] = a.payload; } })
            .addCase(updateSectionThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(deleteSectionThunk.pending, (s) => { s.loading = true; })
            .addCase(deleteSectionThunk.fulfilled, (s, a) => { s.loading = false; s.sections = s.sections.filter((sec) => sec.id !== a.payload); })
            .addCase(deleteSectionThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(createLessonThunk.pending, (s) => { s.loading = true; })
            .addCase(createLessonThunk.fulfilled, (s) => { s.loading = false; })
            .addCase(createLessonThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(updateLessonThunk.pending, (s) => { s.loading = true; })
            .addCase(updateLessonThunk.fulfilled, (s) => { s.loading = false; })
            .addCase(updateLessonThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(deleteLessonThunk.pending, (s) => { s.loading = true; })
            .addCase(deleteLessonThunk.fulfilled, (s) => { s.loading = false; })
            .addCase(deleteLessonThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    },
});

export const { clearSectionError, setSections } = sectionSlice.actions;
export default sectionSlice.reducer;
