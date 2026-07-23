import axios from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  updateAuthTokens,
} from "./authStorage";

const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.url?.includes("/api/auth/reissue")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/api/auth/reissue`, { refreshToken })
          .then(({ data: result }) => {
            if (
              result?.isSuccess === false ||
              !result?.data?.access_token ||
              !result?.data?.refresh_token
            ) {
              throw new Error(result?.message || "토큰 재발급 실패");
            }
            updateAuthTokens(result.data);
            return result.data.access_token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const accessToken = await refreshPromise;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

export default api;
