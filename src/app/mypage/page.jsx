import Sidebar from "@/components/Sidebar/Sidebar";
import MyPageLayout from "@/components/mypage/MyPageLayout";

export default function MyPage() {
  return (
    <div className="ml-64 flex min-h-screen bg-white">
      <Sidebar activePage="mypage" />
      <MyPageLayout />
    </div>
  );
}
