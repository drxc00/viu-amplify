import { twMerge } from "tailwind-merge";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <main
      className={twMerge(
        "bg-background min-w-[200px] min-h-[100px] p-4 flex flex-col gap-2 items-center justify-center",
        className
      )}
    >
      {children}
    </main>
  );
}
