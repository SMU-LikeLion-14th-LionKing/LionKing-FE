import Image from "next/image";

export default function SidebarLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/icons/Sidebar/teamply.svg"
        alt="Teamply logo"
        width={43}
        height={43}
        priority
      />

      <h1 className="text-[32px] font-bold leading-[110%]">Teamply</h1>
    </div>
  );
}
