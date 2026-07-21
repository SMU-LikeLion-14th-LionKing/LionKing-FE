export default function MemberCard({ member, isLeader = false }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-5 p-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${member.color}`}>{member.initial}</div>
      <div className="min-w-0 flex-1"><p className="font-semibold">{member.name}{isLeader && <span className="ml-1">(팀장)</span>}</p><p className="truncate text-xs text-gray-3">{member.email}</p></div>
      <span className="shrink-0 rounded-md border border-gray-2 px-2 py-1 text-xs font-semibold">{member.role}</span>
    </div>
  );
}
