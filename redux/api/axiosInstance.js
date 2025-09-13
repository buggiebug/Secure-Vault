import axios from "axios";
import localStorage from "../../components/utils/localStorage";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000", // Replace with your API base URL
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
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
