import axios from "axios";

const api = axios.create({
  baseURL: "https://silver-garbanzo-j6p4gqgg5rgcprqw-5000.app.github.dev",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
