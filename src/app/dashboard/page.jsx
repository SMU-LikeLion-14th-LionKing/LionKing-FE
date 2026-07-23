import Sidebar from "@/components/Sidebar/Sidebar";
import DashboardPosts from "@/components/Posts/DashboardPosts";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <DashboardPosts />
    </div>
  );
}
