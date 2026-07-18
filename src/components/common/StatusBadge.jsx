const STATUS_STYLES = {
  pending: "bg-[#fff3e4] text-orange",
  accepted: "bg-third text-primary",
};

const STATUS_LABELS = {
  pending: "대기 중",
  accepted: "수락 완료",
};

export default function StatusBadge({ status, className = "" }) {
  const label = STATUS_LABELS[status];

  if (!label) return null;

  return (
    <span
      className={`inline-flex box-content h-[27px] w-[74px] items-center justify-center rounded-[10px] px-[23px] py-[5px] text-sm font-semibold ${STATUS_STYLES[status]} ${className}`}
    >
      {label}
    </span>
  );
}
