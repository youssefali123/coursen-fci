import api from "../../api/axios";

// swagger3: All Auth endpoints

export const login = async (data) => {
    const res = await api.post("/api/Auth/login", data);
    return res.data;
};

export const register = async (data) => {
    const res = await api.post("/api/Auth/register", data);
    return res.data;
};

export const refreshToken = async () => {
    const res = await api.post("/api/Auth/refresh-token");
    return res.data;
};

export const logout = async () => {
    const res = await api.post("/api/Auth/logout");
    return res.data;
};

export const externalLogin = async (data) => {
    const res = await api.post("/api/Auth/external-login", data);
    return res.data;
};

// swagger3: ChangePasswordDto { currentPassword, newPassword, confirmNewPassword }
export const changePassword = async (data) => {
    const res = await api.post("/api/Auth/change-password", data);
    return res.data;
};