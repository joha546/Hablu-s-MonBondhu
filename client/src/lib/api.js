import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:2222/api", // <- use http locally
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
