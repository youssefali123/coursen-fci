import * as authApi from "./auth.api";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("token");

export const setTokens = (token, refreshToken, exp) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (exp) localStorage.setItem("exp", exp);
};

export const clearTokens = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("exp");
    localStorage.removeItem("user");
};

// ─── User persistence ─────────────────────────────────────────────────────────
export const persistUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
};

export const getPersistedUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ─── Auth actions ─────────────────────────────────────────────────────────────

export const login = async (data) => {
    const res = await authApi.login(data);
    if (res.token) {
        setTokens(res.token, res.refreshToken, res.exp);
    }
    return res;
};

export const register = async (data) => {
    const res = await authApi.register(data);
    if (res?.token) {
        setTokens(res.token, res.refreshToken, res.exp);
    }
    return res;
};

export const logout = async () => {
    try {
        await authApi.logout();
    } catch {
        // Ignore logout errors – still clear local state
    } finally {
        clearTokens();
    }
};

export const refreshToken = async () => {
    const res = await authApi.refreshToken();
    if (res?.token) {
        setTokens(res.token, res.refreshToken, res.exp);
    }
    return res?.token;
};

export const changePassword = async (data) => {
    return authApi.changePassword(data);
};

export const isAuthenticated = () => !!getToken();
