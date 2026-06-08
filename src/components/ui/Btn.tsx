"use client";

import type { ButtonHTMLAttributes } from "react";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export function Btn({ variant, className, children, ...rest }: BtnProps) {
  return (
    <button
      className={`btn${variant ? " " + variant : ""}${className ? " " + className : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
