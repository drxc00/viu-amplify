import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<T>;

export function Button<T extends React.ElementType = "button">({
  as,
  children,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";

  return (
    <Component
      {...props}
      className={twMerge(
        "py-1.5 px-2 rounded-md border-zinc-400 bg-primary text-background hover:bg-amber-500 text-md font-semibold",
        className
      )}
    >
      {children}
    </Component>
  );
}
