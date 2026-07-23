import { Suspense } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import TeamInviteForm from "@/components/Projects/TeamInviteForm";

export default function InvitePage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-[63px]">
        <Suspense>
          <TeamInviteForm />
        </Suspense>
      </main>
    </div>
  );
}
