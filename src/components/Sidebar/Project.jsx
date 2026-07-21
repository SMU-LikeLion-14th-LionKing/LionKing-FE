"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";

export default function Project() {
  const pathname = usePathname();

  return (
    <section className="mt-8">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-base font-medium leading-none">프로젝트</h2>
        <button
          type="button"
          aria-label="프로젝트 추가"
          className="flex h-[18px] w-[18px] items-center justify-center"
        >
          <Image
            src="/icons/Sidebar/addTeam.svg"
            alt=""
            width={18}
            height={18}
          />
        </button>
      </div>

      <SidebarItem
        title="라이온킹"
        icon="/icons/Sidebar/lion.svg"
        href="/teammanagement"
        active={pathname === "/teammanagement"}
      />
    </section>
  );
}
