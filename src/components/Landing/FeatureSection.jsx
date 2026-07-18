import Image from "next/image";
import FeatureCard from "./FeatureCard";

const features = [
  {
    number: "01",
    title: "AI 소통 개선",
    description: "부정적 표현과 모호한 말투를 감지하고 더 협업 친화적인 표현으로 제안해요.",
    visual: (
      <div className="relative h-[120px] w-full">
        <span className="absolute left-5 top-0 rounded-lg bg-[#e9e9e9]/60 px-4 py-3">왜 아직 안했어요?</span>
        <Image
          src="/icons/LandingPage/rightArrow.svg"
          alt=""
          width={33}
          height={25}
          className="absolute left-24 top-12"
        />
        <span className="absolute left-[140px] top-9 rounded-lg bg-[#e8f3ff] px-4 py-3">진행 상황을<br />공유해주실 수 있을까요?</span>
      </div>
    ),
  },
  {
    number: "02",
    title: "AI 일정 관리",
    description: "회의록 기반으로 해야할 일과 마감일을 자동으로 정리해줘요.",
    visual: (
      <div className="relative mx-auto w-[190px] pt-5">
        <Image
          src="/icons/LandingPage/checklist.svg"
          alt=""
          width={73}
          height={73}
          className="absolute left-0 top-0 z-0 h-[73px] w-[73px]"
        />
        <div className="relative z-10 ml-9 rounded-xl bg-[#e8f3ff] p-4 shadow-sm">
          <div>회의록 기반 체크리스트</div>
          <div className="mt-2 space-y-1 border-t border-[#3182f6] pt-2">
            {["담당자 지정", "마감일 설정", "일정 자동 등록"].map((item) => (
              <p key={item} className="flex items-center gap-1">
                <Image src="/icons/LandingPage/check.svg" alt="" width={16} height={16} />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "AI 브리핑",
    description: "프로젝트 데이터를 분석해 이번 주 우선순위와 이슈를 한 눈에 알려줘요.",
    visual: (
      <div className="mx-auto w-[230px] rounded-xl bg-[#e9e9e9]/60 p-5">
        <p>이번 주 브리핑</p>
        <div className="mt-2 space-y-1 border-t border-[#a0a0a0] pt-2">
          <p>진행률 60% (일정보다 -10%)</p>
          <p>우선순위 TOP 3</p>
          <p>최근 소통 이슈 2건</p>
          <p>다음주 예정 사항</p>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "AI 협업 지원",
    description: "질문 구체화, 작업 연결 등 팀 협업을 AI가 도와줘요.",
    visual: (
      <div className="relative h-[120px] w-full">
        <span className="absolute left-5 top-0 rounded-lg bg-[#e9e9e9]/60 px-4 py-3">API 오류 해결 방법 아시나요?</span>
        <Image
          src="/icons/LandingPage/downArrow.svg"
          alt=""
          width={25}
          height={32}
          className="absolute left-[210px] top-2"
        />
        <span className="absolute left-5 top-14 flex items-center gap-2 rounded-lg bg-[#e8f3ff] px-4 py-3">
          <Image src="/icons/LandingPage/agent.svg" alt="" width={33} height={29} className="shrink-0" />
          <span>오류가 어떤 환경에서 발생했고,<br />어떤 오류 메시지가 나오는지 설명해주세요.</span>
        </span>
      </div>
    ),
  },
];

export default function FeatureSection() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pb-20 sm:px-10 lg:px-16 lg:pb-28">
      <h2 className="text-center text-3xl font-bold tracking-[-0.07em] text-[#252525] sm:text-4xl lg:text-[42px]">
        AI 협업 매니저의 <span className="text-[#3182f6]">4가지 핵심기능</span>
      </h2>
      <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {features.map((feature) => <FeatureCard key={feature.number} {...feature} />)}
      </div>
    </section>
  );
}
