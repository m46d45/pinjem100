import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Landmark, Layers, ScrollText } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { LogoMark } from "@/components/layout/logo-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/proyek", label: "Proyek", icon: ClipboardList },
  { to: "/portofolio", label: "Portofolio", icon: Layers },
  { to: "/keuangan", label: "Keuangan", icon: Landmark },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onPanduan = pathname === "/";
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="size-7" />
            <span className="text-xl font-semibold tracking-tight text-primary">Pinjem100</span>
          </Link>
          <div className="flex items-center gap-2">
            {offline ? (
              <span className="rounded-full bg-muted px-2 py-1 text-xs text-foreground">
                Offline
              </span>
            ) : null}
            <Link
              to="/"
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm",
                onPanduan
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <ScrollText className="size-4" />
              Panduan
            </Link>
          </div>
        </div>
        <p className="mx-auto hidden max-w-6xl px-4 pb-1.5 text-[11px] leading-tight text-muted-foreground sm:block">
          Laboratorium Virtual Simulasi Kas Proyek Konstruksi
        </p>
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 pb-2 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-24 md:pb-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        <ul className="grid grid-cols-3">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
