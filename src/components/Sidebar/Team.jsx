"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

const DEFAULT_TEAMS = [
  { teamName: "라이온킹", icon: "/icons/Sidebar/lion.svg" },
  { teamName: "타이거킹", icon: "/icons/Sidebar/tiger.svg" },
  { teamName: "버거킹", icon: "/icons/Sidebar/burger.svg" },
];
const TEAM_ICONS = [
  "/icons/Sidebar/lion.svg",
  "/icons/Sidebar/tiger.svg",
  "/icons/Sidebar/burger.svg",
];
const DEFAULT_ICON_BY_TEAM_NAME = Object.fromEntries(
  DEFAULT_TEAMS.map((team) => [team.teamName, team.icon]),
);
const subscribeToTeams = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getTeamsSnapshot = () => sessionStorage.getItem("project_teams") || "[]";
const getServerTeamsSnapshot = () => "[]";

function TeamItem({ team, onSelect }) {
  return (
    <div className="group border-b border-gray-5">
      <Link
        href="/main"
        onClick={() => onSelect(team)}
        className="flex w-full items-center gap-2 border border-transparent px-2 py-2 group-hover:bg-gray-4"
      >
        <Image src={team.icon} alt="" width={28} height={28} />
        <span className="text-base font-medium leading-none">
          {team.teamName}
        </span>
      </Link>

      <div className="max-h-0 overflow-hidden opacity-0 transition-all group-hover:max-h-10 group-hover:opacity-100 group-focus-within:max-h-10 group-focus-within:opacity-100">
        <Link
          href="/teammanagement"
          className="block py-2 pl-12 text-sm text-gray-2 hover:bg-gray-4 hover:text-gray-1"
        >
          팀페이지
        </Link>
      </div>
    </div>
  );
}

export default function Team() {
  const storedTeamsSnapshot = useSyncExternalStore(
    subscribeToTeams,
    getTeamsSnapshot,
    getServerTeamsSnapshot,
  );
  const teams = useMemo(() => {
    const createdTeams = JSON.parse(storedTeamsSnapshot).map((team, index) => ({
      ...team,
      icon:
        DEFAULT_ICON_BY_TEAM_NAME[team.teamName] ||
        team.icon ||
        TEAM_ICONS[index % TEAM_ICONS.length],
    }));
    const createdNames = new Set(createdTeams.map((team) => team.teamName));
    return [
      ...createdTeams,
      ...DEFAULT_TEAMS.filter((team) => !createdNames.has(team.teamName)),
    ];
  }, [storedTeamsSnapshot]);

  const selectTeam = (team) => {
    if (team.projectId) {
      sessionStorage.setItem("selected_project_id", String(team.projectId));
    } else {
      sessionStorage.removeItem("selected_project_id");
    }
    sessionStorage.setItem("selected_team_name", team.teamName);
    sessionStorage.setItem("selected_team_icon", team.icon);
    sessionStorage.setItem("selected_project_title", team.projectTitle || "");
    window.dispatchEvent(new Event("team-selection-changed"));
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
        <TeamItem
          key={`${team.projectId ?? "default"}-${team.teamName}-${index}`}
          team={team}
          onSelect={selectTeam}
        />
      ))}
    </section>
  );
}
