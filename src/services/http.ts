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
  const token = window.localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
