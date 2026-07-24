import axios from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  updateAuthTokens,
} from "./authStorage";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isReissueRequest = originalRequest?.url?.includes(
      "/api/auth/reissue",
    );
    const isPublicAuthRequest = [
      "/api/auth/login",
      "/api/auth/signup",
      "/api/auth/password/send-code",
      "/api/auth/password/verify-code",
      "/api/auth/me/password",
    ].some((path) => originalRequest?.url?.includes(path));

    if (
      !isUnauthorized ||
      !originalRequest ||
      originalRequest._retry ||
      isReissueRequest ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${apiBaseUrl}/api/auth/reissue`, {
            refreshToken,
          })
          .then((response) => {
            const result = response.data;
            if (
              result?.isSuccess === false ||
              !result?.data?.access_token ||
              !result?.data?.refresh_token
            ) {
              throw new Error(
                result?.message || "토큰 재발급에 실패했습니다.",
              );
            }
            updateAuthTokens(result.data);
            return result.data.access_token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

export default api;
