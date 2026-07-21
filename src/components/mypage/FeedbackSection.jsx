import FeedbackCard from "./FeedbackCard";

const FEEDBACK_RECORDS = [
  { status: "말투교정", feedback: "어색한 말과 표현을 조금만 확인해 주세요.", suggestion: "바쁘시겠지만 가급적 빠른 확인 부탁드립니다." },
  { status: "누락감지", feedback: "회의록 분석 결과, 작성하신 게시글에 자동 로그인 기능 내용이 누락되었습니다. 추가 확인이 필요합니다." },
  { status: "말투교정", feedback: "3페이지의 색상과 폰트 스타일을 수정할 것 같습니다.", suggestion: "페이지의 색상과 폰트 스타일이 다른 슬라이드와 달라 보입니다. 전체 디자인의 통일감을 위해 동일한 색상과 폰트 스타일로 수정 부탁드립니다." },
  { status: "말투교정", feedback: "일정 공유 문구를 조금 더 명확하게 다듬어 주세요.", suggestion: "참여자들이 확인할 수 있도록 마감 일시와 담당자를 함께 작성해 주세요." },
  { status: "누락감지", feedback: "요구사항 문서에서 예외 처리 기준이 확인되지 않았습니다. 관련 내용을 추가해 주세요." },
  { status: "말투교정", feedback: "공지 제목에 핵심 내용을 먼저 배치하면 더 쉽게 이해할 수 있습니다." },
];

export default function FeedbackSection() {
  return (
    <section className="flex h-[526px] w-full max-w-[562px] flex-col rounded-2xl border border-gray-5 bg-white p-10">
      <h2 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">AI 피드백 기록</h2>
      <div className="mt-4 flex h-[388px] w-[456px] max-w-full flex-none flex-col items-start gap-4 self-start overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-2/70">
        {FEEDBACK_RECORDS.map((record, index) => <FeedbackCard key={`${record.status}-${index}`} {...record} />)}
      </div>
    </section>
  );
}
