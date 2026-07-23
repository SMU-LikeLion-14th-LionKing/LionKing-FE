"use client";

import Image from "next/image";
import Link from "next/link";

const teams = [
  { name: "라이온킹", icon: "/icons/Sidebar/lion.svg" },
  { name: "타이거킹", icon: "/icons/Sidebar/tiger.svg" },
  { name: "버거킹", icon: "/icons/Sidebar/burger.svg" },
];

function TeamItem({ name, icon }) {
  return (
    <div className="group border-b border-gray-5">
      <Link
        href="/main"
        className="flex w-full items-center gap-2 border border-transparent px-2 py-2 group-hover:bg-gray-4"
      >
        <Image src={icon} alt="" width={28} height={28} />
        <span className="text-base font-medium leading-none">{name}</span>
      </Link>

      <div className="max-h-0 overflow-hidden opacity-0 transition-all group-hover:max-h-10 group-hover:opacity-100 group-focus-within:max-h-10 group-focus-within:opacity-100">
        <Link
          href="/teammanagement"
          className="block py-2 pl-12 text-sm text-gray-2 hover:bg-gray-4 hover:text-gray-1"
        >
          팀페이지
        </Link>
      </div>
    </div>
  );
}

export default function Team() {
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

      {teams.map((team) => (
        <TeamItem
          key={team.name}
          {...team}
        />
      ))}
    </section>
  );
}
