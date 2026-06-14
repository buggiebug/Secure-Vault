import axios from "axios";
import localStorage from "../../components/utils/localStorage";

const axiosInstance = axios.create({
  baseURL: "https://p6bp7xgb-4000.inc1.devtunnels.ms", // Replace with your API base URL
  timeout: 100000, // Timeout in seconds, If request is not completed within this time, it will throw an error
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
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
