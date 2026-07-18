import { scheduleTimeline } from "@/constants/teamManagement";
import ScheduleGroup from "./ScheduleGroup";

export default function ScheduleSection() {
  return (
    <section className="rounded-2xl border border-gray-5 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-7 text-xl font-bold sm:text-2xl">AI 일정 상세</h2>
      <div className="relative border-l-2 border-gray-5">{scheduleTimeline.map((group) => <ScheduleGroup key={group.date} group={group} />)}</div>
    </section>
  );
}
