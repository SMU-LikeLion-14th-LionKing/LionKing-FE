export default function WorkspaceCard({ workspace }) {
  return (
    <button type="button" className="flex w-full items-center gap-4 rounded-xl border border-gray-5 p-3 text-left transition hover:border-primary hover:bg-third">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold ${workspace.color}`}>{workspace.mark}</div>
      <span className="flex-1 text-lg font-semibold">{workspace.name}</span>
      <span aria-hidden className="text-2xl font-light">→</span>
    </button>
  );
}
