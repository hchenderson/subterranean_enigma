import { cn } from "@/lib/utils";

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className)}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.83 0-6.94-2.97-6.94-6.94s3.11-6.94 6.94-6.94c2.2 0 3.59.87 4.48 1.72l2.4-2.4C18.68 1.96 15.96 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c6.94 0 12.03-4.92 12.03-12.03 0-.78-.08-1.56-.21-2.31H12.48z"></path>
    </svg>
  );
}
