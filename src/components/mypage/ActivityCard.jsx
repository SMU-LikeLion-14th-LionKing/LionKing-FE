const badgeClasses = {
  게시글: "bg-primary text-white",
  댓글: "bg-third text-primary",
};

export default function ActivityCard({ type, title, project, date }) {
  return (
    <article className="flex items-center gap-5 rounded-xl border border-gray-5 bg-gray-4 px-5 py-4">
      <span className={`flex h-11 w-21 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${badgeClasses[type]}`}>
        {type}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-gray-1">{title}</h3>
        <p className="mt-2 text-xs text-gray-3">
          {project} <span className="font-medium text-gray-1">{date}</span>
        </p>
      </div>
    </article>
  );
}
