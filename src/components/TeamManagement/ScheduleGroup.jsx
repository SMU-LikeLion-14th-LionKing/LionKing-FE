import ScheduleItem from "./ScheduleItem";

const toneStyles = { red: "text-error before:bg-error", orange: "text-orange before:bg-orange", green: "text-green before:bg-green" };

export default function ScheduleGroup({ group }) {
  return (
    <div className={`relative pb-5 pl-6 last:pb-0 before:absolute before:-left-[5px] before:top-1 before:h-2 before:w-2 before:rounded-full ${toneStyles[group.tone]}`}>
      <h3 className="mb-3 text-sm font-bold">{group.date}</h3>
      <div className="space-y-2">{group.items.map((item) => <ScheduleItem key={item} item={item} tone={group.tone} />)}</div>
    </div>
  );
}
