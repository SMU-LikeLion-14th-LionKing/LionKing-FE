import ProjectCreateForm from "@/components/Projects/ProjectCreateForm";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function ProjectCreatePage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-[63px]">
        <ProjectCreateForm />
      </main>
    </div>
  );
}
