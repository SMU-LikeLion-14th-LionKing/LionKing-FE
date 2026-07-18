import { workspaceList } from "@/constants/teamManagement";
import Image from "next/image";
import WorkspaceCard from "./WorkspaceCard";

export default function WorkspaceSection() {
  return (
    <section className="rounded-2xl border border-gray-5 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">팀 워크스페이스</h2><button type="button" aria-label="워크스페이스 추가" className="flex h-8 w-8 items-center justify-center"><Image src="/icons/TeamManagement/addWorkspace.svg" alt="" width={28} height={28} /></button></div>
      <div className="space-y-3">{workspaceList.map((workspace) => <WorkspaceCard key={workspace.name} workspace={workspace} />)}</div>
    </section>
  );
}
