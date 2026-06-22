import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studentsApi from './students/students.api';

const initialState = {
    dashboard: null,
    profile: null,
    loading: false,
    error: null,
};

// swagger3: No studentId needed — all use JWT token
export const fetchStudentDashboard = createAsyncThunk('student/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try { const res = await studentsApi.getDashboard(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard'); }
    }
);

export const fetchStudentProfile = createAsyncThunk('student/fetchProfile',
    async (_, { rejectWithValue }) => {
        try { const res = await studentsApi.getProfile(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load profile'); }
    }
);

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        clearStudentError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentDashboard.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchStudentDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload; })
            .addCase(fetchStudentDashboard.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
        builder
            .addCase(fetchStudentProfile.pending, (s) => { s.loading = true; })
            .addCase(fetchStudentProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload; })
            .addCase(fetchStudentProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    },
});

export const { clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;
