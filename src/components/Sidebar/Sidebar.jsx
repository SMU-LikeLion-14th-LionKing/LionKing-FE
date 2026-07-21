import UserProfile from "./UserProfile";
import BottomMenu from "./BottomMenu";
import Project from "./Project";
import Team from "./Team";
import MyPage from "./MyPage";
import SidebarLogo from "./SidebarLogo";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col overflow-y-auto border-r border-gray-5 bg-white px-4 py-6">
      <SidebarLogo />
      <UserProfile />
      <Project />
      <Team />
      <MyPage />
      <BottomMenu />
    </aside>
  );
}
