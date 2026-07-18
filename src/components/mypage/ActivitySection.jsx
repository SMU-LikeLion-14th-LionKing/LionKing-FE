import ActivityCard from "./ActivityCard";

const ACTIVITIES = [
  { type: "게시글", title: "게시글 카드 디자인 어떤 게 더 직관적인가요?", project: "라이온킹 프로젝트", date: "2026.07.10" },
  { type: "게시글", title: "로그인 화면 구현 완료", project: "타이거킹 프로젝트", date: "2026.07.10" },
  { type: "댓글", title: "발표 PPT 1차 제작 완료", project: "라이온킹 프로젝트", date: "2026.07.10" },
  { type: "댓글", title: "회원가입 화면 구현 완료", project: "버거킹 프로젝트", date: "2026.07.10" },
];

export default function ActivitySection() {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-5 bg-white p-7 sm:p-9">
      <h2 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">나의 활동</h2>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-3">
        {ACTIVITIES.map((activity) => <ActivityCard key={activity.title} {...activity} />)}
      </div>
    </section>
  );
}
