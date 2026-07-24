import SidebarItem from "./SidebarItem";

export default function MyPage({ active = false }) {
  return (
    <section className="mt-3">
      <SidebarItem
        title="마이페이지"
        icon="/icons/Sidebar/myPage.svg"
        href="/mypage"
        active={active}
      />

      <div className="mt-3 space-y-2 pl-2">
        <p className="text-xs font-normal leading-[172%]">나의 활동</p>
        <p className="text-xs font-normal leading-[172%]">AI 피드백 기록</p>
      </div>
    </section>
  );
}
