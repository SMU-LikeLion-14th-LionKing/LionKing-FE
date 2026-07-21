"use client";

import { workspaceList } from "@/constants/teammanagement";
import Image from "next/image";
import { useState } from "react";
import WorkspaceCard from "./WorkspaceCard";

export default function WorkspaceSection() {
  const [workspaces, setWorkspaces] = useState(() => workspaceList.map((workspace) => ({
    ...workspace,
    id: workspace.name,
  })));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const canSubmit = Boolean(workspaceName.trim() && workspaceUrl.trim());

  const closeModal = () => {
    setIsModalOpen(false);
    setWorkspaceName("");
    setWorkspaceUrl("");
  };

  const registerWorkspace = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const normalizedValue = `${workspaceName} ${workspaceUrl}`.toLowerCase();
    const icon = normalizedValue.includes("figma")
      ? "/icons/TeamManagement/figma.svg"
      : normalizedValue.includes("github")
        ? "/icons/TeamManagement/github.svg"
        : "/icons/TeamManagement/tiger.svg";

    setWorkspaces((current) => [...current, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: workspaceName.trim(),
      url: workspaceUrl.trim(),
      icon,
    }]);
    closeModal();
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

            <button type="submit" disabled={!canSubmit} className={`mt-[29px] h-12 w-full rounded-[10px] text-base font-semibold transition ${canSubmit ? "bg-primary text-white hover:bg-secondary" : "cursor-not-allowed bg-gray-5 text-gray-3"}`}>
              등록
            </button>
          </form>
        </div>
      )}
    </>
  );
}
