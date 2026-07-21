import ActivityCard from "./ActivityCard";

const ACTIVITIES = [
  { type: "게시글", title: "게시글 카드 디자인 어떤 게 더 직관적인가요?", project: "라이온킹 프로젝트", date: "2026.07.10" },
  { type: "게시글", title: "로그인 화면 구현 완료", project: "타이거킹 프로젝트", date: "2026.07.10" },
  { type: "댓글", title: "발표 PPT 1차 제작 완료", project: "라이온킹 프로젝트", date: "2026.07.10" },
  { type: "댓글", title: "회원가입 화면 구현 완료", project: "버거킹 프로젝트", date: "2026.07.10" },
  { type: "게시글", title: "프로젝트 대시보드 기능을 추가했습니다", project: "라이온킹 프로젝트", date: "2026.07.11" },
  { type: "댓글", title: "회의록 내용 확인 부탁드립니다", project: "타이거킹 프로젝트", date: "2026.07.12" },
  { type: "게시글", title: "알림 설정 UI 검토 요청", project: "버거킹 프로젝트", date: "2026.07.13" },
];

export default function ActivitySection() {
  return (
    <section className="flex h-[526px] w-full max-w-[562px] flex-col rounded-2xl border border-gray-5 bg-white p-10">
      <h2 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">나의 활동</h2>
      <div className="mt-4 flex h-[388px] w-full flex-none flex-col items-start gap-3 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-2/70">
        {ACTIVITIES.map((activity, index) => <ActivityCard key={`${activity.title}-${index}`} {...activity} />)}
      </div>
    </section>
  );
}
