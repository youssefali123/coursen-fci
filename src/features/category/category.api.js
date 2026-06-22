import api from "../../api/axios";

// swagger4: GET /api/Category/Categories — returns all categories
export const getCategories = () =>
    api.get("/api/Category/Categories");

// swagger4: GET /api/Category/{categoryId}
export const getCategoryById = (categoryId) =>
    api.get(`/api/Category/${categoryId}`);

// swagger4: POST /api/Category/Add-Category/{categoryName}
// categoryName must match pattern: ^[A-Za-z]*$
export const createCategory = (categoryName) =>
    api.post(`/api/Category/Add-Category/${encodeURIComponent(categoryName)}`);

// swagger4: PUT /api/Category/update/{categoryId}/{categoryName}
export const updateCategory = (categoryId, categoryName) =>
    api.put(`/api/Category/update/${categoryId}/${encodeURIComponent(categoryName)}`);

// swagger4: DELETE /api/Category/{categoryId}
export const deleteCategory = (categoryId) =>
    api.delete(`/api/Category/${categoryId}`);
