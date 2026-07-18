import Image from "next/image";

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[1440px] items-center px-6 pt-10 sm:px-10 lg:px-9 lg:pt-12">
      <a href="/dashboard" className="flex items-center gap-3" aria-label="Teamply 메인 페이지로 이동">
        <Image
          src="/icons/Sidebar/teamply.svg"
          alt="Teamply"
          width={43}
          height={43}
          className="h-12 w-12 sm:h-14 sm:w-14"
          priority
        />
        <span className="text-4xl font-bold tracking-[-0.06em] text-[#2868d5] sm:text-5xl">
          Teamply
        </span>
        <span className="pt-1 text-xl font-bold tracking-[-0.07em] text-black sm:text-2xl">
          팀플리
        </span>
      </a>
    </header>
  );
}
