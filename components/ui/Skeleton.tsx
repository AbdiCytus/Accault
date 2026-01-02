// components/ui/Skeleton.tsx
import { HTMLAttributes } from "react";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  // Menggunakan animate-pulse bawaan Tailwind untuk efek berdenyut
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };
