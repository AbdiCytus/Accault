// components/ui/Tooltip.tsx
import { ReactNode } from "react";

type Props = {
  text: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({ text, children, position = "right" }: Props) {
  // Mapping posisi CSS
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2", // Default user request
  };

  // Mapping posisi panah kecil
  const arrowClasses = {
    top: "left-1/2 -translate-x-1/2 -bottom-1 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent",
    bottom:
      "left-1/2 -translate-x-1/2 -top-1 border-b-gray-900 border-r-transparent border-t-transparent border-l-transparent",
    left: "top-1/2 -translate-y-1/2 -right-1 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "top-1/2 -translate-y-1/2 -left-1 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div className="group/tooltip relative flex items-center">
      {children}

      {/* Tooltip Container */}
      <div
        className={`absolute z-60 hidden group-hover/tooltip:block whitespace-nowrap bg-gray-900 text-white text-[10px] font-medium py-1.5 px-2.5 rounded-md shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none ${positionClasses[position]}`}>
        {text}

        {/* Panah Kecil (CSS Border Hack agar lebih rapi) */}
        <div
          className={`absolute border-4 w-0 h-0 ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
}
