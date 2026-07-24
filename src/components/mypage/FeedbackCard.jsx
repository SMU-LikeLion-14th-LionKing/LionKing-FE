const badgeClasses = {
  말투교정: "bg-[#dcfce7] text-green",
  누락감지: "bg-[#ffe4e6] text-[#ff4057]",
};

export default function FeedbackCard({ status, feedback, suggestion }) {
  const badgeClass = badgeClasses[status] || "bg-third text-primary";

  return (
    <article className="w-[448px] max-w-full shrink-0 rounded-xl border border-gray-5 bg-gray-4 px-5 py-4">
      <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>{status}</span>
      <p className="mt-3 text-xs leading-relaxed text-gray-1">{feedback}</p>
      {suggestion && <p className="mt-2 text-xs leading-relaxed text-green">{suggestion}</p>}
    </article>
  );
}
