import Sidebar from "@/components/Sidebar/Sidebar";

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-gray-4"></main>
    </div>
  );
}