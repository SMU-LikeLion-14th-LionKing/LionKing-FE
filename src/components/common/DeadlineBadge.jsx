import Icon from "./Icon";

const VARIANT_CLASSES = {
  normal: "bg-primary text-white",
  urgent: "bg-[#ffe0e0] text-error",
  completed: "bg-gray-4 text-gray-2",
};

export default function DeadlineBadge({
  date,
  dDay,
  remainingTime,
  completed = false,
  variant = "normal",
  className = "",
}) {
  const status = completed ? "completed" : variant;

  return (
    <div
      className={`flex w-fit items-center gap-2 rounded-full px-5 py-2 text-lg font-semibold ${VARIANT_CLASSES[status]} ${className}`}
    >
      <Icon name="alarm" size={22} monochrome />
      <span>마감일</span>
      {date && <span>{date}</span>}
      {completed ? (
        <span>마감 완료</span>
      ) : (
        <>
          {dDay && <span>({dDay})</span>}
          {remainingTime && <span>{remainingTime}</span>}
        </>
      )}
    </div>
  );
}
