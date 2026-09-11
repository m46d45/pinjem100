export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="6" fill="#2156A5" />
      <rect x="5.5" y="5.5" width="21" height="21" rx="2" fill="#F4F6F8" />
      <path d="M8 16h16" stroke="#2156A5" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M8 16 14.5 24 24 10"
        fill="none"
        stroke="#C23B2E"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="10" r="1.8" fill="#2156A5" />
    </svg>
  );
}
