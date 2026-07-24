"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import api from "@/lib/api";
import WorkspaceCard from "./WorkspaceCard";

const subscribeToProject = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getProjectSnapshot = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getServerProjectSnapshot = () => "";

const getWorkspaceIcon = (name, url) => {
  const normalizedValue = `${name} ${url}`.toLowerCase();
  if (normalizedValue.includes("figma")) {
    return "/icons/TeamManagement/figma.svg";
  }
  if (normalizedValue.includes("github")) {
    return "/icons/TeamManagement/github.svg";
  }
  return "/icons/TeamManagement/tiger.svg";
};

export default function WorkspaceSection() {
  const projectId = useSyncExternalStore(
    subscribeToProject,
    getProjectSnapshot,
    getServerProjectSnapshot,
  );
  const [workspaces, setWorkspaces] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const canSubmit = Boolean(workspaceName.trim() && workspaceUrl.trim());

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();

    const fetchWorkspaces = async () => {
      try {
        const { data: result } = await api.get(
          `/api/projects/${projectId}/workspaces`,
          { signal: controller.signal },
        );

        if (result?.isSuccess === false || !Array.isArray(result?.data)) {
          throw new Error(
            result?.message || "워크스페이스 목록을 불러오지 못했습니다.",
          );
        }

        setWorkspaces(
          result.data.map((workspace) => ({
            id: workspace.link_id,
            name: workspace.name,
            url: workspace.url,
            icon: getWorkspaceIcon(workspace.name, workspace.url),
          })),
        );
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("워크스페이스 목록 조회 실패:", error);
          setWorkspaces([]);
        }
      }
    };

    fetchWorkspaces();
    return () => controller.abort();
  }, [projectId]);

  const closeModal = () => {
    setIsModalOpen(false);
    setWorkspaceName("");
    setWorkspaceUrl("");
    setSubmitError("");
  };

  const registerWorkspace = async (event) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;
    if (!projectId) {
      setSubmitError("프로젝트를 먼저 선택해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const { data: result } = await api.post(
        `/api/projects/${projectId}/workspaces`,
        {
          name: workspaceName.trim(),
          url: workspaceUrl.trim(),
        },
      );

      if (result?.isSuccess === false || !result?.data) {
        throw new Error(result?.message || "워크스페이스 등록에 실패했습니다.");
      }

      const workspace = result.data;
      setWorkspaces((current) => [
        ...current,
        {
          id: workspace.link_id,
          name: workspace.name,
          url: workspace.url,
          icon: getWorkspaceIcon(workspace.name, workspace.url),
        },
      ]);
      closeModal();
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "워크스페이스 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-gray-5 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">팀 워크스페이스</h2><button type="button" onClick={() => setIsModalOpen(true)} aria-label="워크스페이스 추가" className="flex h-6 w-6 cursor-pointer items-center justify-center"><Image src="/icons/TeamManagement/addWorkspace.svg" alt="" width={24} height={24} /></button></div>
        <div className="h-[152px] space-y-3 overflow-y-auto pr-1">{workspaces.map((workspace) => <WorkspaceCard key={workspace.id} workspace={workspace} />)}</div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onMouseDown={closeModal}>
          <form className="relative w-full max-w-[580px] rounded-[10px] border-2 border-primary bg-white px-[38px] pb-[46px] pt-[48px] shadow-xl" role="dialog" aria-modal="true" aria-label="워크스페이스 추가" onMouseDown={(event) => event.stopPropagation()} onSubmit={registerWorkspace}>
            <button type="button" onClick={closeModal} aria-label="워크스페이스 추가 창 닫기" className="absolute right-0 top-[-32px] h-[22px] w-[22px] cursor-pointer">
              <Image src="/icons/common/close.svg" alt="" width={22} height={22} />
            </button>

            <label className="block text-sm font-semibold text-[#4e5968]">
              이름
              <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="워크스페이스 이름을 입력하세요." className="mt-2 h-[53px] w-full rounded-[10px] bg-gray-4 px-6 font-normal text-black outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary" autoFocus />
            </label>

            <label className="mt-8 block text-sm font-semibold text-[#4e5968]">
              URL
              <input type="url" value={workspaceUrl} onChange={(event) => setWorkspaceUrl(event.target.value)} placeholder="URL을 입력하세요." className="mt-2 h-[53px] w-full rounded-[10px] bg-gray-4 px-6 font-normal text-black outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary" />
            </label>

            {submitError && <p role="alert" className="mt-4 text-sm font-medium text-error">{submitError}</p>}
            <button type="submit" disabled={!canSubmit || isSubmitting} className={`mt-[29px] h-12 w-full rounded-[10px] text-base font-semibold transition ${canSubmit && !isSubmitting ? "bg-primary text-white hover:bg-secondary" : "cursor-not-allowed bg-gray-5 text-gray-3"}`}>
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
