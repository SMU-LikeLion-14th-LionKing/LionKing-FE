"use client";

import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_PROFILE_JSON,
  getProfileSnapshot,
  subscribeToProfile,
} from "@/lib/profileStorage";

export default function UserProfile() {
  const profileSnapshot = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    () => DEFAULT_PROFILE_JSON,
  );
  const profile = useMemo(
    () => JSON.parse(profileSnapshot),
    [profileSnapshot],
  );

  return (
    <div className="mt-10 flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-green text-lg font-bold text-white">
        {profile.image ? (
          <Image
            src={profile.image}
            alt={`${profile.name} 프로필`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          profile.name.trim().charAt(0)
        )}
      </div>

      <div>
        <p className="text-base font-medium leading-[140%]">{profile.name}</p>

        <p className="text-sm font-normal leading-[140%] text-gray-3">
          {profile.email}
        </p>
      </div>
    </div>
  );
}
