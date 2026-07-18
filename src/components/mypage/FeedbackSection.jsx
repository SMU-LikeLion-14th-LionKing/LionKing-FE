import FeedbackCard from "./FeedbackCard";

const FEEDBACK_RECORDS = [
  { status: "말투교정", feedback: "“이거 빨리 확인 좀 해주세요.”", suggestion: "“바쁘시겠지만 가급적 빠른 확인 부탁드립니다.”" },
  { status: "누락감지", feedback: "회의록 분석 결과, 작성하신 게시글에 ‘자동 로그인 기능’ 내용이 누락되었습니다. 추가 확인이 필요합니다." },
  { status: "말투교정", feedback: "“3페이지의 디자인 수정이 필요할 것 같습니다.”", suggestion: "“3페이지의 색상과 폰트 스타일이 다른 슬라이드와 달라 보입니다. 전체 디자인의 통일감을 위해 동일한 색상의 폰트 스타일로 수정 부탁드립니다.”" },
];

export default function FeedbackSection() {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-5 bg-white p-7 sm:p-9">
      <h2 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">AI 피드백 기록</h2>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-3">
        {FEEDBACK_RECORDS.map((record, index) => <FeedbackCard key={`${record.status}-${index}`} {...record} />)}
      </div>
    </section>
  );
}
