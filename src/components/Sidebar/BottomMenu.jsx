import Image from "next/image";

export default function BottomMenu() {
  return (
    <div className="mt-auto flex gap-4">
      <button type="button" aria-label="설정">
        <Image
          src="/icons/Sidebar/settings.svg"
          alt=""
          width={24}
          height={24}
        />
      </button>

      <div className="relative">
        <button type="button" aria-label="알림">
          <Image
            src="/icons/Sidebar/alarm.svg"
            alt=""
            width={24}
            height={24}
          />
        </button>

        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
          3
        </div>
      </div>
    </div>
  );
}
