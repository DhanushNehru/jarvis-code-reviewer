import axios from "axios";
import { auth } from "./firebase";

// Hardcoded for production to completely bypass Docker build argument injection issues!
// If your backend URL is different, change it here before deploying.
const API_BASE = "https://jarvis-backend-727998743684.us-central1.run.app/api";

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

export const submitCodeReview = async (code, language, model = "gemini-2.5-flash") => {
  const response = await api.post("/review", { code, language, model });
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
