import axios from "axios";
import { auth } from "./firebase";

// When deployed to Cloud Run, this will be the Cloud Run URL. For local dev, we proxy or point to localhost.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor to inject Firebase ID token into every request
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const submitCodeReview = async (code, language) => {
  const response = await api.post("/review", { code, language });
  return response.data;
};

export const getReviewHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

export const getHistoryStats = async () => {
  const response = await api.get("/history/stats");
  return response.data;
};
