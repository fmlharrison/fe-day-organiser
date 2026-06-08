import type { ButtonHTMLAttributes, ReactNode } from "react";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: string;
  className?: string;
};

export function Btn({
  children,
  variant = "",
  className = "",
  ...rest
}: BtnProps) {
  const classes = ["btn", ...variant.split(" "), className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
