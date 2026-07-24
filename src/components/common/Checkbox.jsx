"use client";

import Image from "next/image";

export default function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  size = 32,
  className = "",
  ...props
}) {
  return (
    <label
      className={`inline-flex w-fit cursor-pointer items-center gap-[9px] text-sm font-normal leading-[1.4] text-[#4E5968] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${className}`}
    >
      <span className="relative shrink-0" style={{ width: size, height: size }}>
        <input
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded-[6px] border-2 border-[#4E5968] peer-checked:hidden" />
        <span className="pointer-events-none absolute inset-0 hidden items-center justify-center peer-checked:flex">
          <Image
            src="/icons/common/bluecheck.svg"
            alt=""
            width={size}
            height={size}
          />
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
