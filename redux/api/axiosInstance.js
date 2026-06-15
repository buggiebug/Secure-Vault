import axios from "axios";
import localStorage from "../../components/utils/localStorage";

const axiosInstance = axios.create({
  baseURL: "https://p6bp7xgb-4000.inc1.devtunnels.ms", // Replace with your API base URL
  timeout: 20000, // 20 Secs ( 1000000 = 10 Secs) ( If request is not completed within this time, it will throw an error )
  headers: {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip, deflate", // Support compression from backend
  },
});

let store;
export const injectStore = (_store) => {
  store = _store;
};

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await localStorage.getItem("userToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["usertoken"] = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.message === "Authorization header is required"
    ) {
      await localStorage.removeItem("userToken");
      if (store) {
        store.dispatch({ type: "auth/forceLogout" });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
