const AUTH_KEYS = ["access_token", "refresh_token", "user_id"];

const getStorages = () =>
  typeof window === "undefined"
    ? []
    : [window.localStorage, window.sessionStorage];

export function getAuthStorage() {
  return (
    getStorages().find((storage) => storage.getItem("refresh_token")) ?? null
  );
}

export function getAccessToken() {
  return getAuthStorage()?.getItem("access_token") ?? null;
}

export function getRefreshToken() {
  return getAuthStorage()?.getItem("refresh_token") ?? null;
}

export function saveAuthTokens(authData, keepLoggedIn) {
  if (typeof window === "undefined") return;

  clearAuthTokens();
  const storage = keepLoggedIn
    ? window.localStorage
    : window.sessionStorage;
  storage.setItem("access_token", authData.access_token);
  storage.setItem("refresh_token", authData.refresh_token);
  if (authData.user_id !== undefined) {
    storage.setItem("user_id", String(authData.user_id));
  }
}

export function updateAuthTokens({ access_token, refresh_token }) {
  const storage = getAuthStorage();
  if (!storage) return;
  storage.setItem("access_token", access_token);
  storage.setItem("refresh_token", refresh_token);
}

export function clearAuthTokens() {
  getStorages().forEach((storage) => {
    AUTH_KEYS.forEach((key) => storage.removeItem(key));
  });
}
