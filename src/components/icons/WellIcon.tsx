import { cn } from "@/lib/utils";

export function WellIcon({ className }: { className?: string }) {
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 8v4l2 2" />
      <path d="M18.36 18.36l-1.41-1.41" />
      <path d="M5.64 5.64l1.41 1.41" />
      <path d="M18.36 5.64l-1.41 1.41" />
      <path d="M5.64 18.36l1.41-1.41" />
    </svg>
  );
}
