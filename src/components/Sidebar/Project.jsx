"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import SidebarItem from "./SidebarItem";

const DEFAULT_TEAMS = JSON.stringify([
  {
    projectId: null,
    teamName: "라이온킹",
    projectTitle: "AI로 팀원 간의 소통 오류를 없앨 수 있다면?",
  },
]);
const subscribeToTeams = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getTeamsSnapshot = () =>
  sessionStorage.getItem("project_teams") || DEFAULT_TEAMS;
const getServerTeamsSnapshot = () => DEFAULT_TEAMS;
const getSelectedProjectSnapshot = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getServerSelectedProjectSnapshot = () => "";

export default function Project() {
  const teamsSnapshot = useSyncExternalStore(
    subscribeToTeams,
    getTeamsSnapshot,
    getServerTeamsSnapshot,
  );
  const teams = useMemo(() => JSON.parse(teamsSnapshot), [teamsSnapshot]);
  const selectedProjectId = useSyncExternalStore(
    subscribeToTeams,
    getSelectedProjectSnapshot,
    getServerSelectedProjectSnapshot,
  );

  const selectTeam = (team) => {
    if (team.projectId) {
      sessionStorage.setItem("selected_project_id", String(team.projectId));
    } else {
      sessionStorage.removeItem("selected_project_id");
    }
    sessionStorage.setItem("selected_team_name", team.teamName);
    sessionStorage.setItem(
      "selected_project_title",
      team.projectTitle || "",
    );
    window.dispatchEvent(new Event("team-selection-changed"));
    window.location.assign("/main");
  };

  return (
    <section className="mt-8">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-base font-medium leading-none">프로젝트</h2>
        <Link
          href="/projects/create"
          aria-label="프로젝트 추가"
          className="flex h-[18px] w-[18px] items-center justify-center"
        >
          <Image
            src="/icons/Sidebar/addTeam.svg"
            alt=""
            width={18}
            height={18}
          />
        </Link>
      </div>

      {teams.map((team, index) => (
        <SidebarItem
          key={`${team.projectId ?? "default"}-${team.teamName}-${index}`}
          title={team.teamName}
          icon="/icons/Sidebar/lion.svg"
          onClick={() => selectTeam(team)}
          active={
            team.projectId
              ? String(team.projectId) === selectedProjectId
              : !selectedProjectId
          }
        />
      ))}
    </section>
  );
}
