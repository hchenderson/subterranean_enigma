import { cn } from "@/lib/utils";

export function ArchiveIcon({ className }: { className?: string }) {
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
      <path d="M4 6h16" />
      <path d="M6 10h12" />
      <path d="M8 14h8" />
      <path d="M10 18h4" />
      <path d="M3 3v18h18V3H3z" />
    </svg>
  );
}
