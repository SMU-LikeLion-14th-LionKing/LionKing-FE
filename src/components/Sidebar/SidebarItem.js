import Image from "next/image";

export default function SidebarItem({
  title,
  icon,
  active = false,
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 border px-2 py-2 text-left ${
        active
          ? "border-blue-200 bg-blue-50"
          : "border-transparent hover:bg-gray-4"
      }`}
    >
      <Image src={icon} alt="" width={28} height={28} />
      <span className="text-base font-medium leading-none">{title}</span>
    </button>
  );
}
