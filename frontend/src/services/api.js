import axios from "axios";

function inferApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const origin = window.location.origin;

  if (origin.includes("localhost:5173")) {
    return "http://localhost:5000";
  }

  const codespaceOrigin = origin.replace(
    /-\d+\.app\.github\.dev$/,
    "-5000.app.github.dev",
  );

  return codespaceOrigin || "http://localhost:5000";
}

const envBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: envBaseUrl || inferApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
