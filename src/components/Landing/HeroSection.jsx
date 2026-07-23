import Image from "next/image";
import Link from "next/link";

function ChatBubble({ className, children }) {
  return (
    <div className={`rounded-2xl bg-[#e9e9e9]/40 px-5 py-4 shadow-[0_12px_30px_rgba(47,116,221,0.12)] ${className}`}>
      {children}
    </div>
  );
}

function HeroArtwork() {
  return (
    <div className="relative mx-auto mt-8 h-[360px] w-full max-w-[540px] sm:h-[420px] lg:mt-0 lg:-translate-x-24">
      <Image
        src="/icons/LandingPage/bigCircle.svg"
        alt=""
        width={368}
        height={368}
        className="absolute left-[68%] top-[20%] w-64 -translate-x-1/2 -translate-y-1/2 sm:w-[368px]"
      />
      <Image
        src="/icons/LandingPage/smallCircle.svg"
        alt=""
        width={208}
        height={208}
        className="absolute left-[40%] top-[54%] w-32 -translate-x-1/2 sm:w-[208px]"
      />

      <ChatBubble className="absolute left-0 top-2 w-[230px] sm:left-2 sm:w-[300px]">
        <div className="flex items-center gap-4">
          <Image
            src="/icons/LandingPage/user.svg"
            alt=""
            width={45}
            height={48}
            className="h-9 w-9"
          />
          <div className="space-y-2">
            <p className="text-lg leading-[1.4] font-semibold text-gray-1/40 sm:text-xl">
              팀원 A
            </p>
            <p className="text-sm leading-[1.4] font-medium text-gray-1/40 sm:text-base">
              왜 아직도 안 했어요?
            </p>
          </div>
        </div>
      </ChatBubble>

      <div className="absolute bottom-0 right-0 w-[92%] rounded-xl border border-[#3182f6] bg-white p-6 shadow-[0_16px_30px_rgba(47,116,221,0.10)] sm:bottom-14 sm:w-[86%] sm:p-10">
        <span className="inline-flex rounded-lg border border-[#3182f6] bg-[#eff7ff] px-3 py-2 text-xs font-semibold text-[#3182f6] sm:text-sm">
          AI 협업 매니저 제안
        </span>
        <p className="mt-5 text-center text-lg font-bold tracking-[-0.05em] text-black sm:text-2xl">
          진행 상황을 공유해주실 수 있을까요?
        </p>
        <div className="mt-5 rounded-lg bg-[#347fee] py-2 text-center text-sm font-semibold text-white sm:text-base">
          적용하기
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-6 pb-16 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-2 lg:gap-14 lg:px-16 lg:pb-14">
      <div className="max-w-[560px] lg:-translate-y-8">
        <h1 className="text-4xl leading-[1.3] font-bold tracking-[-0.05em] text-gray-1 sm:text-[48px]">
          AI가 팀플의<br />
          소통 오류를 줄여<br />
          팀프로젝트를 <span className="text-primary">더 완벽하게</span>
        </h1>
        <p className="mt-5 text-xl leading-[1.4] font-medium tracking-[-0.05em] text-gray-1 sm:text-2xl">
          AI 협업 매니저와 함께 하는 팀 프로젝트
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/login" className="flex h-14 items-center justify-center rounded-xl bg-[#347fee] px-8 text-lg font-semibold text-white transition-colors hover:bg-[#2868d5]">
            로그인
          </Link>
          <Link href="/signup" className="flex h-14 items-center justify-center rounded-xl border border-[#3182f6] bg-white px-8 text-lg font-semibold text-[#252525] transition-colors hover:bg-[#f4f8ff]">
            회원가입
          </Link>
        </div>
      </div>
      <HeroArtwork />
    </section>
  );
}
