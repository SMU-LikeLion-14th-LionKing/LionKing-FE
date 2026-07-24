"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const TEAM_ICONS = [
  "/icons/Sidebar/lion.svg",
  "/icons/Sidebar/tiger.svg",
  "/icons/Sidebar/burger.svg",
];


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
          onClick={() => onSelect(team)}
          className="block py-2 pl-12 text-sm text-gray-2 hover:bg-gray-4 hover:text-gray-1"
        >
          팀페이지
        </Link>
      </div>
    </div>
  );
}

export default function Team() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        const { data: result } = await api.get("/api/projects");
        if (result?.isSuccess === false || !Array.isArray(result?.data)) {
          throw new Error(result?.message || "프로젝트 목록을 불러오지 못했습니다.");
        }

        if (isMounted) {
          setTeams(
            result.data.map((project, index) => ({
              projectId: project.id,
              teamName: project.name,
              projectTitle: project.title,
              icon: TEAM_ICONS[index % TEAM_ICONS.length],
            })),
          );
        }
      } catch (error) {
        console.error("프로젝트 목록 조회 실패:", error);
        if (isMounted) setTeams([]);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectTeam = (team) => {
    if (team.projectId !== undefined && team.projectId !== null) {
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
