import axios from "axios";
import localStorage from "../../components/utils/localStorage";
const axiosInstance = axios.create({
    baseURL: "https://p6bp7xgb-4000.inc1.devtunnels.ms", // Replace with your API base URL
    timeout: 15000, // 15s timeout — reasonable for mobile, prevents long hangs on slow networks
    headers: {
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate", // Support compression from backend
    },
});
// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await localStorage.getItem("userToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers["usertoken"] = `${token}`;
        }
        // Tag each request with retry metadata
        config.__retryCount = config.__retryCount || 0;
        return config;
    },
    (error) => Promise.reject(error)
);
// Retry interceptor — automatic retry with exponential backoff
// Only retries GET requests on network errors and 5xx server errors.
// POST/PUT/DELETE are NOT retried to prevent duplicate mutations.
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s backoff
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        // Don't retry if:
        // - No config (cancelled request)
        // - Already exceeded max retries
        // - It's a mutation (POST/PUT/PATCH/DELETE)
        // - It's a 4xx client error (auth failure, bad request, etc.)
        if (
            !config ||
            config.__retryCount >= MAX_RETRIES ||
            config.method !== "get" ||
            (error.response && error.response.status >= 400 && error.response.status < 500)
        ) {
            return Promise.reject(error);
        }
        // Only retry on network errors (no response) or 5xx server errors
        const isNetworkError = !error.response;
        const isServerError = error.response && error.response.status >= 500;
        if (isNetworkError || isServerError) {
            config.__retryCount += 1;
            const delay = BASE_DELAY_MS * Math.pow(2, config.__retryCount - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return axiosInstance(config);
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;