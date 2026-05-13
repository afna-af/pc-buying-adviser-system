import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("rigs_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export function formatApiError(detail) {
  if (!detail) return "Something went wrong.";

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .join(" ");
  }

  if (detail.msg && typeof detail.msg === "string") {
    return detail.msg;
  }

  return JSON.stringify(detail);
}

export default api;
