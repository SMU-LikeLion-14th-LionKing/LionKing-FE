"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import DateTimePicker, {
  formatDateTime,
} from "@/components/Posts/DateTimePicker";

const CATEGORIES = [
  "IT/소프트웨어",
  "교양/학술",
  "공모전",
  "디자인/영상",
  "마케팅/기획",
  "기타",
];
const TEAM_ICONS = [
  "/icons/Sidebar/lion.svg",
  "/icons/Sidebar/tiger.svg",
  "/icons/Sidebar/burger.svg",
];

const fieldClass =
  "h-14 w-full rounded-[10px] border border-transparent bg-gray-4 px-6 text-[15px] text-[#333d4b] outline-none transition placeholder:text-[#333d4b] focus:border-primary focus:bg-white";

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2.5 block text-sm font-semibold text-[#4e5968]"
    >
      {children} <span className="text-error">*</span>
    </label>
  );
}

export default function ProjectCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    teamName: "",
    projectName: "",
    category: "",
    deadline: null,
  });
  const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError("");
  };

  const isComplete = Object.values(form).every(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isComplete || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/projects/create", {
        name: form.teamName.trim(),
        projectType: form.category,
        title: form.projectName.trim(),
        deadline: new Date(form.deadline).toISOString(),
      });
      const result = response.data;

      if (result?.isSuccess === false) {
        throw new Error(result.message || "프로젝트 생성에 실패했습니다.");
      }

      const projectId = result?.data?.id;
      if (projectId === undefined || projectId === null) {
        throw new Error("프로젝트 생성 응답에 ID가 없습니다.");
      }

      const storedTeams = JSON.parse(
        sessionStorage.getItem("project_teams") || "[]",
      );
      if (storedTeams.length === 0) {
        const previousTeamName =
          sessionStorage.getItem("selected_team_name") || "라이온킹";
        const previousProjectId = sessionStorage.getItem("selected_project_id");
        const previousProjectTitle =
          sessionStorage.getItem("selected_project_title") ||
          "AI로 팀원 간의 소통 오류를 없앨 수 있다면?";
        storedTeams.push({
          projectId: previousProjectId,
          teamName: previousTeamName,
          projectTitle: previousProjectTitle,
        });
      }

      const iconUsage = Object.fromEntries(
        TEAM_ICONS.map((icon) => [
          icon,
          storedTeams.filter((team) => team.icon === icon).length,
        ]),
      );
      const minimumUsage = Math.min(...Object.values(iconUsage));
      const leastUsedIcons = TEAM_ICONS.filter(
        (icon) => iconUsage[icon] === minimumUsage,
      );
      const selectedIcon =
        leastUsedIcons[Math.floor(Math.random() * leastUsedIcons.length)];

      const nextTeam = {
        projectId: String(projectId),
        teamName: form.teamName.trim(),
        projectTitle: form.projectName.trim(),
        icon: selectedIcon,
      };
      const nextTeams = [
        nextTeam,
        ...storedTeams.filter(
          (team) => String(team.projectId) !== String(projectId),
        ),
      ];
      sessionStorage.setItem("project_teams", JSON.stringify(nextTeams));
      sessionStorage.setItem("selected_project_id", String(projectId));
      sessionStorage.setItem("selected_team_name", form.teamName.trim());
      sessionStorage.setItem("selected_team_icon", nextTeam.icon);
      sessionStorage.setItem("selected_project_title", form.projectName.trim());
      router.push(
        `/invite?team=${encodeURIComponent(form.teamName)}&project=${encodeURIComponent(form.projectName)}&projectId=${encodeURIComponent(projectId)}`,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "프로젝트 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="mx-auto w-full max-w-[612px] rounded-[11px] border-2 border-gray-5 bg-white px-6 py-10 sm:px-[41px] sm:pb-8 sm:pt-[42px]">
        <h1 className="text-[32px] font-bold tracking-[-0.7px] text-[#191f28]">
          프로젝트 생성
        </h1>

        <form onSubmit={handleSubmit} className="mt-[45px]">
          <div>
            <FieldLabel htmlFor="teamName">팀 명</FieldLabel>
            <input
              id="teamName"
              value={form.teamName}
              onChange={updateField("teamName")}
              className={fieldClass}
              placeholder="팀 명을 입력하세요."
            />
          </div>

          <div className="mt-[43px]">
            <FieldLabel htmlFor="projectName">프로젝트 명</FieldLabel>
            <input
              id="projectName"
              value={form.projectName}
              onChange={updateField("projectName")}
              className={fieldClass}
              placeholder="프로젝트를 입력하세요."
            />
          </div>

          <fieldset className="mt-[43px]">
            <legend className="mb-[27px] text-sm font-semibold text-[#4e5968]">
              프로젝트 분야 <span className="text-error">*</span>
            </legend>
            <div className="grid grid-cols-1 gap-x-[27px] gap-y-8 sm:grid-cols-2">
              {CATEGORIES.map((category) => {
                const selected = form.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setForm((current) => ({ ...current, category }))
                    }
                    className={`h-14 rounded-[10px] border text-[15px] transition ${
                      selected
                        ? "border-primary bg-third font-semibold text-primary"
                        : "border-transparent bg-gray-4 text-[#333d4b] hover:bg-gray-5"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-[43px]">
            <FieldLabel htmlFor="deadline">마감기한</FieldLabel>
            <button
              id="deadline"
              type="button"
              onClick={() => setIsDeadlinePickerOpen(true)}
              className={`${fieldClass} text-left`}
            >
              {form.deadline
                ? formatDateTime(form.deadline)
                : "마감기한 및 시간을 입력하세요."}
            </button>
          </div>

          <div className="mt-[33px] flex justify-end">
            {error && (
              <p
                role="alert"
                className="mr-auto self-center text-sm text-error"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="h-14 w-[168px] rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3"
            >
              {isLoading ? "생성 중..." : "프로젝트 생성"}
            </button>
          </div>
        </form>
      </section>
      {isDeadlinePickerOpen && (
        <DateTimePicker
          value={form.deadline}
          label="프로젝트 마감기한"
          onClose={() => setIsDeadlinePickerOpen(false)}
          onConfirm={(date) => {
            setForm((current) => ({ ...current, deadline: date }));
            setIsDeadlinePickerOpen(false);
            if (error) setError("");
          }}
        />
      )}
    </>
  );
}
