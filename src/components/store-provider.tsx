import { useEffect, useState, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePinjem } from "@/lib/cashflow/store";
import { AppShell } from "@/components/layout/app-shell";
import { StatsBeacon } from "@/components/layout/stats-beacon";

/**
 * Persist uses skipHydration; rehydrate runs here. StatsBeacon must not mount
 * (and must not write) until hasHydrated is true — otherwise its child effects
 * persist the default satu-pasar state over the student's saved data.
 *
 * Start hydrated=false so SSR never touches persist APIs; client effect only.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = usePinjem.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (usePinjem.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      void usePinjem.persist.rehydrate();
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const pages = ["/", "/proyek", "/portofolio", "/keuangan"];
    for (const path of pages) {
      void fetch(path, { credentials: "same-origin" }).catch(() => undefined);
    }
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <AppShell>
        {hydrated ? <StatsBeacon /> : null}
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
