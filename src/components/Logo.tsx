export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.12" />
      <path
        d="M9 31c3-1 5-4 8-4s5 3 8 3 5-3 8-3 4 3 7 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M14 27c1-7 5-11 10-11 4 0 6 2 7 5 1 2 3 3 5 2-1 4-4 5-7 4-1 3-3 4-5 4-5 0-9-1-10-4z"
        fill="currentColor"
      />
      <circle cx="28.5" cy="19.5" r="1.3" fill="var(--sand, #f8f3ea)" />
    </svg>
  );
}
