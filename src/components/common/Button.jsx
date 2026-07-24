const VARIANT_CLASSES = {
  primary: "bg-primary text-white hover:bg-[#2875e5] active:bg-[#246bd2]",
  secondary: "bg-secondary text-white hover:bg-[#1758c3] active:bg-[#1450af]",
  light: "bg-gray-4 text-gray-3 hover:bg-gray-5",
  outline: "border border-primary bg-white text-primary hover:bg-third",
};

const SIZE_CLASSES = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-5",
};


export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`form inline-flex items-center justify-center rounded-md whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:bg-gray-4 disabled:text-gray-3 ${
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md
      } ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
