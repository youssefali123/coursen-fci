import axios from "axios";

const BASE_URL = "https://coursen.runasp.net";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach Bearer token ────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 with silent refresh ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${BASE_URL}/api/Auth/refresh-token`, {}, {
                    withCredentials: true,
                });
                const { token, refreshToken, exp } = res.data;
                localStorage.setItem("token", token);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("exp", exp);
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
                processQueue(null, token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clear session and redirect to login
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("exp");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
