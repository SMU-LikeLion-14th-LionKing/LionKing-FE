import UserProfile from "./UserProfile";
import BottomMenu from "./BottomMenu";
import Team from "./Team";
import MyPage from "./MyPage";
import SidebarLogo from "./SidebarLogo";

export default function Sidebar({ activePage }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-gray-5 bg-white px-5 py-6 transition-all">
      <div className="notification-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
        <SidebarLogo />
        <UserProfile />
        <Team />
        <MyPage active={activePage === "mypage"} />
      </div>

      <div className="mt-auto pt-4">
        <BottomMenu />
      </div>
    </aside>
  );
}
