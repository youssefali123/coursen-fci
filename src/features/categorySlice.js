import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryApi from './category/category.api';

// Static fallback used if API is unavailable (e.g. during dev without backend)
const FALLBACK_CATEGORIES = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Mobile Development' },
    { id: 3, name: 'Data Science' },
    { id: 4, name: 'UI/UX Design' },
    { id: 5, name: 'Machine Learning' },
    { id: 6, name: 'Cloud Computing' },
    { id: 7, name: 'Cybersecurity' },
    { id: 8, name: 'DevOps' },
];

const initialState = {
    categories: [],
    loading: false,
    error: null,
};

// swagger4: GET /api/Category/Categories
export const fetchCategories = createAsyncThunk('category/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await categoryApi.getCategories();
            // Handle both array response and wrapped { data: [] } response
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.categories || []);
            if (!Array.isArray(data) || data.length === 0) return FALLBACK_CATEGORIES;
            return data;
        } catch {
            return FALLBACK_CATEGORIES;
        }
    }
);

export const createCategoryThunk = createAsyncThunk('category/create',
    async (categoryName, { rejectWithValue }) => {
        try {
            const res = await categoryApi.createCategory(categoryName);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateCategoryThunk = createAsyncThunk('category/update',
    async ({ id, name }, { rejectWithValue }) => {
        try {
            const res = await categoryApi.updateCategory(id, name);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update category');
        }
    }
);

export const deleteCategoryThunk = createAsyncThunk('category/delete',
    async (categoryId, { rejectWithValue }) => {
        try {
            await categoryApi.deleteCategory(categoryId);
            return categoryId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        clearCategoryError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchCategories.fulfilled, (s, a) => {
                s.loading = false;
                s.categories = Array.isArray(a.payload) ? a.payload : [];
            })
            .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

        builder
            .addCase(createCategoryThunk.pending, (s) => { s.loading = true; })
            .addCase(createCategoryThunk.fulfilled, (s, a) => {
                s.loading = false;
                if (a.payload) s.categories.push(a.payload);
            })
            .addCase(createCategoryThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

        builder
            .addCase(updateCategoryThunk.fulfilled, (s, a) => {
                if (a.payload) {
                    const i = s.categories.findIndex((c) => c.id === a.payload.id);
                    if (i !== -1) s.categories[i] = a.payload;
                }
            });

        builder
            .addCase(deleteCategoryThunk.fulfilled, (s, a) => {
                s.categories = s.categories.filter((c) => c.id !== a.payload);
            });
    },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
