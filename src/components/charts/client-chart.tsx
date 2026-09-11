import { useEffect, useState, type ReactNode } from "react";

export function ClientChart({
  children,
  height = 280,
}: {
  children: ReactNode;
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div
        className="w-full animate-pulse rounded-lg bg-muted"
        style={{ height }}
        aria-hidden
      />
    );
  }
  return <>{children}</>;
}
