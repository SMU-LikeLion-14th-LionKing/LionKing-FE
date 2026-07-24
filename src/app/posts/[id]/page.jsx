import Sidebar from "@/components/Sidebar/Sidebar";
import PostDetail from "@/components/Posts/PostDetail";

export default function PostDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <PostDetail />
      </div>
    </div>
  );
}
