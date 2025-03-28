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
        "p-2 rounded-sm border-zinc-400 bg-amber-500 text-zinc-950 hover:bg-amber-600 text-md font-semibold",
        className
      )}
    >
      {children}
    </Component>
  );
}
