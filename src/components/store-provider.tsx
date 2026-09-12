import { useEffect, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePinjem } from "@/lib/cashflow/store";
import { AppShell } from "@/components/layout/app-shell";
import { StatsBeacon } from "@/components/layout/stats-beacon";

export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void usePinjem.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const pages = ["/", "/proyek", "/portofolio", "/akumulasi", "/pinjam"];
    for (const path of pages) {
      void fetch(path, { credentials: "same-origin" }).catch(() => undefined);
    }
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <AppShell>
        <StatsBeacon />
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
