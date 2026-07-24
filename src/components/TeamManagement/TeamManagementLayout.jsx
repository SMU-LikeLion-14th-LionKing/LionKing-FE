"use client";

import CalendarSection from "./CalendarSection";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import api from "@/lib/api";
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
const getProjectIdSnapshot = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getServerProjectIdSnapshot = () => "";

export default function TeamManagementLayout() {
  const storedTeamName = useSyncExternalStore(
    subscribeToTeam,
    getTeamNameSnapshot,
    getServerTeamNameSnapshot,
  );
  const projectId = useSyncExternalStore(
    subscribeToTeam,
    getProjectIdSnapshot,
    getServerProjectIdSnapshot,
  );
  const [teamName, setTeamName] = useState(storedTeamName);

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();
    const fetchTeamName = async () => {
      try {
        const { data: result } = await api.get("/api/projects", {
          signal: controller.signal,
        });
        const project = Array.isArray(result?.data)
          ? result.data.find(
              (item) => String(item.id) === String(projectId),
            )
          : null;

        if (project) {
          const nextTeamName =
            project.teamName?.trim() || "이름 없는 팀";
          setTeamName(nextTeamName);
          sessionStorage.setItem("selected_team_name", nextTeamName);
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("팀 이름 조회 실패:", error);
        }
      }
    };

    fetchTeamName();
    return () => controller.abort();
  }, [projectId]);

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
