import axios from "axios";

function apiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
  const clean = String(configured).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

export const api = axios.create({
  baseURL: apiBaseUrl(),
  timeout: 15_000
});

api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem("admin_token");
  if (token) {
    if (config.headers) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});
