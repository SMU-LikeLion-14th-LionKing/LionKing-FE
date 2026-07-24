import CalendarSection from "./CalendarSection";
import Image from "next/image";
import MemberSection from "./MemberSection";
import ScheduleSection from "./ScheduleSection";
import WorkspaceSection from "./WorkspaceSection";

export default function TeamManagementLayout() {
  return (
    <main className="min-w-0 flex-1 bg-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold sm:text-[36px]"><Image src="/icons/Sidebar/lion.svg" alt="" width={40} height={40} />라이온킹</h1>
        <CalendarSection />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5"><WorkspaceSection /><MemberSection /></div>
          <ScheduleSection />
        </div>
      </div>
    </main>
  );
}
