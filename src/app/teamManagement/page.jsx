import Sidebar from "@/components/Sidebar/Sidebar";
import TeamManagementLayout from "@/components/teamManagement/TeamManagementLayout";

export default function TeamManagementPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64 flex min-w-0">
        <TeamManagementLayout />
      </div>
    </div>
  );
}
