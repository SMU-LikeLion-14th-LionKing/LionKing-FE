const AUTH_KEYS = ["access_token", "refresh_token", "user_id"];

function getBrowserStorages() {
  if (typeof window === "undefined") return [];
  return [window.localStorage, window.sessionStorage];
}

export function getAuthStorage() {
  const [local, session] = getBrowserStorages();
  if (!local || !session) return null;

  if (local.getItem("refresh_token")) return local;
  if (session.getItem("refresh_token")) return session;
  return null;
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

export function updateAuthTokens(authData) {
  const storage = getAuthStorage();
  if (!storage) return;

  storage.setItem("access_token", authData.access_token);
  storage.setItem("refresh_token", authData.refresh_token);
}

export function clearAuthTokens() {
  getBrowserStorages().forEach((storage) => {
    AUTH_KEYS.forEach((key) => storage.removeItem(key));
  });
}
