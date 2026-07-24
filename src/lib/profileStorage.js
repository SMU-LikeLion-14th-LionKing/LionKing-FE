export const PROFILE_STORAGE_KEY = "teamply_user_profile";
export const DEFAULT_PROFILE = {
  name: "\uAE40\uBA4B\uC0AC",
  email: "likelion@gmail.com",
  image: "",
};

export const DEFAULT_PROFILE_JSON = JSON.stringify(DEFAULT_PROFILE);

export function getProfileSnapshot() {
  if (typeof window === "undefined") return DEFAULT_PROFILE_JSON;
  return localStorage.getItem(PROFILE_STORAGE_KEY) || DEFAULT_PROFILE_JSON;
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("profile-updated"));
}

export function subscribeToProfile(callback) {
  const handleStorage = (event) => {
    if (event.key === PROFILE_STORAGE_KEY) callback();
  };
  window.addEventListener("profile-updated", callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("profile-updated", callback);
    window.removeEventListener("storage", handleStorage);
  };
}
