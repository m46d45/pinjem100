import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { usePinjem, useSimulation } from "@/lib/cashflow/store";
import { recordLabEvent } from "@/lib/stats";

export function StatsBeacon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = usePinjem((s) => s.mode);
  const preset = usePinjem((s) => s.preset);
  const bumpSim = usePinjem((s) => s.bumpSim);
  const markJournal = usePinjem((s) => s.markJournal);
  const sim = useSimulation();
  const first = useRef(true);
  const lastKey = useRef("");

  useEffect(() => {
    void recordLabEvent({ data: { kind: "view", path: pathname } }).catch(() => undefined);
    if (pathname === "/proyek") markJournal({ openedProyek: true });
    if (pathname === "/portofolio") markJournal({ openedPortofolio: true });
    if (pathname === "/akumulasi") markJournal({ openedAkumulasi: true });
  }, [pathname, markJournal]);

  useEffect(() => {
    const key = `${mode}:${preset}:${sim.zone}:${Math.round(sim.peakLoan)}`;
    if (first.current) {
      first.current = false;
      lastKey.current = key;
      return;
    }
    if (lastKey.current === key) return;
    lastKey.current = key;
    bumpSim(sim.zone);
    void recordLabEvent({
      data: { kind: "sim", path: pathname, zone: sim.zone, preset, mode },
    }).catch(() => undefined);
  }, [mode, preset, sim.zone, sim.peakLoan, bumpSim, pathname]);

  return null;
}
