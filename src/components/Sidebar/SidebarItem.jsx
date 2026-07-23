import Image from "next/image";
import Link from "next/link";

export default function SidebarItem({
  title,
  icon,
  active = false,
  href,
  onClick,
}) {
  const className = `flex w-full items-center gap-2 border px-2 py-2 text-left ${
    active
      ? "border-blue-200 bg-blue-50"
      : "border-transparent hover:bg-gray-4"
  }`;
  const content = <><Image src={icon} alt="" width={28} height={28} /><span className="text-base font-medium leading-none">{title}</span></>;

  if (href) {
    return <Link href={href} onClick={onClick} className={className} aria-current={active ? "page" : undefined}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className={className}>{content}</button>
  );
}
