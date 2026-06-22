import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as instructorApi from './instructor/instructor.api';

const initialState = {
    dashboard: null,
    profile: null,
    recentActivity: [],
    loading: false,
    activityLoading: false,
    profileLoading: false,
    error: null,
};

export const fetchInstructorDashboard = createAsyncThunk(
    'instructor/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const res = await instructorApi.getDashboard();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard');
        }
    }
);

export const fetchRecentActivity = createAsyncThunk(
    'instructor/fetchRecentActivity',
    async (count = 4, { rejectWithValue }) => {
        try {
            const res = await instructorApi.getRecentActivity(count);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load activity');
        }
    }
);

// swagger2: NEW — fetch instructor profile by ID
export const fetchInstructorProfile = createAsyncThunk(
    'instructor/fetchProfile',
    async (instructorId, { rejectWithValue }) => {
        try {
            const res = await instructorApi.getInstructorProfile(instructorId);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
        }
    }
);

// swagger2: NEW — edit instructor profile
export const editInstructorProfileThunk = createAsyncThunk(
    'instructor/editProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const fd = new FormData();
            if (profileData.name) fd.append('Name', profileData.name);
            if (profileData.email) fd.append('Email', profileData.email);
            if (profileData.title) fd.append('Title', profileData.title);
            if (profileData.aboutMe) fd.append('AboutMe', profileData.aboutMe);
            if (profileData.bio) fd.append('Bio', profileData.bio);
            if (profileData.image) fd.append('Image', profileData.image);
            const res = await instructorApi.editProfile(fd);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
        }
    }
);

const instructorSlice = createSlice({
    name: 'instructor',
    initialState,
    reducers: {
        clearInstructorError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInstructorDashboard.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchInstructorDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload; })
            .addCase(fetchInstructorDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(fetchRecentActivity.pending, (state) => { state.activityLoading = true; })
            .addCase(fetchRecentActivity.fulfilled, (state, action) => { state.activityLoading = false; state.recentActivity = Array.isArray(action.payload) ? action.payload : []; })
            .addCase(fetchRecentActivity.rejected, (state) => { state.activityLoading = false; });

        builder
            .addCase(fetchInstructorProfile.pending, (state) => { state.profileLoading = true; })
            .addCase(fetchInstructorProfile.fulfilled, (state, action) => { state.profileLoading = false; state.profile = action.payload; })
            .addCase(fetchInstructorProfile.rejected, (state, action) => { state.profileLoading = false; state.error = action.payload; });

        builder
            .addCase(editInstructorProfileThunk.pending, (state) => { state.profileLoading = true; state.error = null; })
            .addCase(editInstructorProfileThunk.fulfilled, (state, action) => { state.profileLoading = false; state.profile = action.payload; })
            .addCase(editInstructorProfileThunk.rejected, (state, action) => { state.profileLoading = false; state.error = action.payload; });
    },
});

export const { clearInstructorError } = instructorSlice.actions;
export default instructorSlice.reducer;
