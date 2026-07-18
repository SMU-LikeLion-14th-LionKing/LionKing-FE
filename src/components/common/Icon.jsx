import Image from "next/image";

const ICON_SOURCES = {
  alarm: "/icons/common/alarm.svg",
  check: "/icons/common/check.svg",
  checkboxCheck: "/icons/common/checkbox-check.svg",
  pending: "/icons/common/pending.svg",
  eye: "/icons/common/eye.svg",
  eyeOff: "/icons/common/eye-off.svg",
  edit: "/icons/common/edit.svg",
  trash: "/icons/common/trash.svg",
  plusCircle: "/icons/common/plus-circle.svg",
};

export default function Icon({
  name,
  size = 24,
  className = "",
  alt = "",
  monochrome = false,
}) {
  const src = ICON_SOURCES[name];

  if (!src) return null;

  if (monochrome) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`inline-block shrink-0 bg-current ${className}`}
        style={{
          width: size,
          height: size,
          maskImage: `url(${src})`,
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskImage: `url(${src})`,
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: "auto" }}
      className={`shrink-0 ${className}`}
    />
  );
}
