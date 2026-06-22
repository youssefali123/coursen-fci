import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from './auth/auth.service';

// ─── Rehydrate user from localStorage on startup ─────────────────────────────
const persistedUser = authService.getPersistedUser();
const hasToken = authService.isAuthenticated();

const initialState = {
    user: hasToken && persistedUser ? persistedUser : null,
    isAuthenticated: hasToken && !!persistedUser,
    loading: false,
    error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// UserRole enum from Swagger: 0=Student, 1=Instructor, 2=Admin
const resolveRole = (roleValue) => {
    if (roleValue === 1 || roleValue === 'Instructor') return 'instructor';
    if (roleValue === 2 || roleValue === 'Admin') return 'admin';
    return 'student'; // 0 = student
};

const normalizeUser = (res) => ({
    id: res.userId || res.id || null,
    name: res.userName || res.username || res.name || '',
    email: res.email || '',
    role: resolveRole(res.roles?.[0] ?? res.role),
    avatar: res.profileImageUrl || res.pathOfImage || res.avatar || null,
    bio: res.bio || '',
});

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await authService.login(credentials);
            const user = normalizeUser(res);
            authService.persistUser(user);
            return user;
        } catch (err) {
            const data = err.response?.data;
            let message = 'Login failed. Please check your credentials.';
            if (data) {
                if (typeof data === 'string') message = data;
                else if (data.message) message = data.message;
                else if (data.errors) {
                    const firstKey = Object.keys(data.errors)[0];
                    message = data.errors[firstKey]?.[0] || message;
                } else if (data.title) message = data.title;
            } else if (err.message) {
                message = err.message;
            }
            return rejectWithValue(message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const res = await authService.register(data);
            // Some backends return user data on register; some don't
            if (res?.token) {
                const user = normalizeUser(res);
                authService.persistUser(user);
                return user;
            }
            // Registration success but no auto-login — return null
            return null;
        } catch (err) {
            const data = err.response?.data;
            let message = 'Registration failed.';
            if (data) {
                if (typeof data === 'string') message = data;
                else if (data.message) message = data.message;
                else if (data.errors) {
                    const firstKey = Object.keys(data.errors)[0];
                    message = data.errors[firstKey]?.[0] || message;
                } else if (data.title) message = data.title;
            }
            return rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
        } catch (err) {
            // Even on failure, clear state
            authService.clearTokens();
            return rejectWithValue(err.message);
        }
    }
);

// swagger4: POST /api/Auth/change-password — ChangePasswordDto { currentPassword, newPassword }
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ currentPassword, newPassword }, { rejectWithValue }) => {
        try {
            await authService.changePassword({ currentPassword, newPassword });
            return true;
        } catch (err) {
            const data = err.response?.data;
            let message = 'Failed to change password.';
            if (data) {
                if (typeof data === 'string') message = data;
                else if (data.message) message = data.message;
                else if (data.errors) { message = data.errors[Object.keys(data.errors)[0]]?.[0] || message; }
                else if (data.title) message = data.title;
            }
            return rejectWithValue(message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Allow direct state updates (e.g. from profile edit)
        updateProfile: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            authService.persistUser(state.user);
        },
        clearError: (state) => {
            state.error = null;
        },
        // Force-set user (e.g. for external login)
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        // ── loginUser ──────────────────────────────────────────────────────
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── registerUser ───────────────────────────────────────────────────
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.isAuthenticated = true;
                    state.user = action.payload;
                }
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── logoutUser ─────────────────────────────────────────────────────
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Force logout even on error
                state.user = null;
                state.isAuthenticated = false;
            });

        // ── changePassword ─────────────────────────────────────────────────
        builder
            .addCase(changePassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(changePassword.fulfilled, (state) => { state.loading = false; })
            .addCase(changePassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { updateProfile, clearError, setUser } = authSlice.actions;

// Legacy action names kept for any existing references
export const loginStart = () => ({ type: 'auth/loginStart' });
export const loginSuccess = (user) => setUser(user);
export const loginFailure = (msg) => ({ type: 'noop', payload: msg });

export default authSlice.reducer;
