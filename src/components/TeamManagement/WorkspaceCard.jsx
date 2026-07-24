import Image from "next/image";

export default function WorkspaceCard({ workspace }) {
  return (
    <a href={workspace.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-4 rounded-xl border border-gray-5 p-3 text-left transition hover:border-primary hover:bg-third">
      <Image src={workspace.icon} alt="" width={55} height={53} className="h-11 w-11 shrink-0 object-contain" />
      <span className="flex-1 text-lg font-semibold">{workspace.name}</span>
      <Image src="/icons/TeamManagement/rightArrow.svg" alt="" width={22} height={15} className="shrink-0" />
    </a>
  );
}
