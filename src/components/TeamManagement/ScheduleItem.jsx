import Checkbox from "@/components/common/Checkbox";

const borderStyles = { red: "border-error", orange: "border-orange", green: "border-green" };

export default function ScheduleItem({ item, tone }) {
  return <div className={`rounded-lg border p-3 ${borderStyles[tone]}`}><Checkbox label={item} /></div>;
}
