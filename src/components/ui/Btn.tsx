import type { ButtonHTMLAttributes, ReactNode } from "react";

type BtnVariant = "" | "teal" | "orange" | "gold" | "ghost";
type BtnSize = "" | "lg" | "sm";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
};

export function Btn({
  children,
  variant = "",
  size = "",
  className = "",
  ...rest
}: BtnProps) {
  const classes = ["btn", variant, size, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
