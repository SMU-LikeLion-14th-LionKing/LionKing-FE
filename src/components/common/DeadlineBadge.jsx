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
      className={`flex h-[34px] w-fit items-center gap-1 rounded-full px-[15px] py-1.5 text-base font-semibold ${VARIANT_CLASSES[status]} ${className}`}
    >
      <Icon name="alarm" size={18} monochrome />
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
