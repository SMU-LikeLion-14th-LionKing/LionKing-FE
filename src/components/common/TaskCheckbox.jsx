"use client";

export default function TaskCheckbox({
  label,
  date,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <label
      className={`caption flex w-fit cursor-pointer items-center gap-2 text-gray-1 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${className}`}
    >
      <span className="relative flex h-3.5 w-3.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded-[2px] border border-gray-2 peer-checked:hidden" />
        <span className="pointer-events-none absolute inset-0 hidden rounded-[2px] bg-gray-1 peer-checked:flex peer-checked:items-center peer-checked:justify-center peer-checked:after:mb-px peer-checked:after:block peer-checked:after:h-1.5 peer-checked:after:w-[7px] peer-checked:after:rotate-45 peer-checked:after:border-b-[1.5px] peer-checked:after:border-r-[1.5px] peer-checked:after:border-white peer-checked:after:content-['']" />
      </span>
      {label && (
        <span>
          {label}
          {date && <span>({date})</span>}
        </span>
      )}
    </label>
  );
}
