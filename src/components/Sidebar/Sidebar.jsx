import UserProfile from "./UserProfile";
import BottomMenu from "./BottomMenu";
import Project from "./Project";
import Team from "./Team";
import MyPage from "./MyPage";
import SidebarLogo from "./SidebarLogo";

export default function Sidebar({ activePage }) {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-5 bg-white px-4 py-6">
      <SidebarLogo />
      <UserProfile />
      <Project />
      <Team />
      <MyPage active={activePage === "mypage"} />
      <BottomMenu />
    </aside>
  );
}
