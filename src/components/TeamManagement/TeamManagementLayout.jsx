"use client";

import CalendarSection from "./CalendarSection";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import MemberSection from "./MemberSection";
import ScheduleSection from "./ScheduleSection";
import WorkspaceSection from "./WorkspaceSection";

const subscribeToTeam = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getTeamNameSnapshot = () =>
  sessionStorage.getItem("selected_team_name") || "라이온킹";
const getServerTeamNameSnapshot = () => "라이온킹";

export default function TeamManagementLayout() {
  const teamName = useSyncExternalStore(
    subscribeToTeam,
    getTeamNameSnapshot,
    getServerTeamNameSnapshot,
  );

  return (
    <main className="min-w-0 flex-1 bg-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold sm:text-[36px]"><Image src="/icons/Sidebar/lion.svg" alt="" width={40} height={40} />{teamName}</h1>
        <CalendarSection />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5"><WorkspaceSection /><MemberSection /></div>
          <ScheduleSection />
        </div>
      </div>
    </main>
  );
}
