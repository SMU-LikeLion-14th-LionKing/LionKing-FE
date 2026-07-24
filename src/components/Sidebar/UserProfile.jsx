"use client";


import { useEffect, useState } from "react";
import api from "@/lib/api";

const DEFAULT_USER = {
  name: "사용자",
  email: "",
  profileImageUrl: null,
};

export default function UserProfile() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await api.get("/api/users/me", {
          signal: controller.signal,
        });
        const result = response.data;

        if (!result?.isSuccess || !result.data) {
          throw new Error(result?.message || "사용자 정보를 불러오지 못했습니다.");
        }

        setUser({
          name: result.data.name || DEFAULT_USER.name,
          email: result.data.email || DEFAULT_USER.email,
          profileImageUrl: result.data.profile_image_url || null,
        });
      } catch (error) {
        if (error.name !== "CanceledError") {
          setUser(DEFAULT_USER);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => controller.abort();
  }, []);

  const initial = user.name.trim().charAt(0) || DEFAULT_USER.name.charAt(0);
  const showProfileImage = user.profileImageUrl && !hasImageError;

  return (
    <div className="mt-10 flex items-center gap-3">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-white">
        {showProfileImage ? (
          // 외부 이미지 호스트가 정해지지 않아 일반 img로 표시합니다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profileImageUrl}
            alt={`${user.name} 프로필 사진`}
            className="h-full w-full object-cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          initial
        )}
      </div>

      <div className="min-w-0">
        {isLoading ? (
          <div className="space-y-2" aria-label="사용자 정보 불러오는 중">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-5" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-5" />
          </div>
        ) : (
          <>
            <p className="truncate text-base font-medium leading-[140%]">
              {user.name}
            </p>
            <p className="truncate text-sm font-normal leading-[140%] text-gray-3">
              {user.email}
            </p>
          </>
        )}

      </div>
    </div>
  );
}
