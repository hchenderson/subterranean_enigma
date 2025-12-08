import { cn } from "@/lib/utils";

export function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 00-12 0" />
      <path d="M12 2v2" />
      <path d="M6 8H4" />
      <path d="M20 8h-2" />
      <path d="M12 14v6" />
      <path d="M9 16h6" />
      <path d="M7.5 11.5l-3 3" />
      <path d="M16.5 11.5l3 3" />
    </svg>
  );
}
