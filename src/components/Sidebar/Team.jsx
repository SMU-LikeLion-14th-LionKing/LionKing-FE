import SidebarItem from "./SidebarItem";

export default function Team() {
  return (
    <div className="mt-4">
      <p className="mb-3 pl-2 text-xs font-normal leading-[172%] text-gray-1">
        팀 페이지
      </p>

      <SidebarItem title="타이거킹" icon="/icons/Sidebar/tiger.svg" />
      <div className="border-b border-gray-5" />

      <SidebarItem title="버거킹" icon="/icons/Sidebar/burger.svg" />
      <div className="border-b border-gray-5" />
    </div>
  );
}
