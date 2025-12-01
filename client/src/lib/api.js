import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
    baseURL: "https://hablu-s-monbondhu-backend.onrender.com/api", // change to your server URL
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// Interceptor to attach token automatically
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized! Please login again.");
            // optional: redirect to login
        }
        return Promise.reject(error);
    }
);

export default apiClient;
