import Sidebar from "@/components/Sidebar/Sidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="ml-64 min-h-screen" />
    </div>
  );
}
