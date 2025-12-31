// src/api/axios.js
import axios from "axios";

// Create an Axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    // Do not set default Content-Type to application/json, let axios set it automatically
});

// Request interceptor to add JWT token to headers
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

// Response interceptor to handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/**
 * Helper function to automatically convert object to FormData
 * Handles file uploads and arrays (like skills)
 */
export const toFormData = (data) => {
    const form = new FormData();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            if (Array.isArray(data[key])) {
                form.append(key, JSON.stringify(data[key])); // تحويل المصفوفة إلى JSON string
            } else {
                form.append(key, data[key]);
            }
        }
    }
    return form;
};

export default api;
