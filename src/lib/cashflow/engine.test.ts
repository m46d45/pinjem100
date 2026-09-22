import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROFIT_RATE,
  applyStartPreset,
  cropActiveWeeks,
  dppOf,
  ownerPay,
  projectDuration,
  rabKind,
  rabRollup,
  sCurve,
  simulate,
  syncContractValue,
  workShares,
} from "./engine.ts";
import { DEFAULT_COMPANY, satuPasarProjects } from "./scenarios.ts";
import type { Company, Project, WeekPoint } from "./types.ts";

function sampleProject(): Project {
  return syncContractValue(satuPasarProjects()[0]!, DEFAULT_COMPANY);
}

describe("sCurve", () => {
  it("is 0 at start and 1 at end for every shape", () => {
    for (const shape of ["front", "normal", "back"] as const) {
      assert.equal(sCurve(0, shape), 0);
      assert.equal(sCurve(1, shape), 1);
    }
  });

  it("front-loads faster than back mid-way", () => {
    assert.ok(sCurve(0.5, "front") > sCurve(0.5, "back"));
  });
});

describe("rabRollup", () => {
  it("builds A–G with default 10% profit and PPN on E", () => {
    const project = sampleProject();
    const roll = rabRollup(project, 0.11);
    assert.equal(roll.profitRate, PROFIT_RATE);
    assert.equal(roll.keuntungan, roll.pokok * 0.1);
    assert.equal(roll.total, roll.pokok + roll.keuntungan);
    assert.ok(Math.abs(roll.ppn - roll.total * 0.11) < 1);
    assert.ok(Math.abs(roll.kontrak - (roll.total + roll.ppn)) < 1);
  });

  it("respects a custom profit rate", () => {
    const project = sampleProject();
    const roll = rabRollup(project, 0.11, 0.15);
    assert.equal(roll.profitRate, 0.15);
    assert.ok(Math.abs(roll.keuntungan - roll.pokok * 0.15) < 1);
  });

  it("keeps contractValue in sync with G", () => {
    const project = sampleProject();
    assert.equal(project.contractValue, rabRollup(project, DEFAULT_COMPANY.ppnRate, DEFAULT_COMPANY.profitRate).kontrak);
  });
});

describe("rabKind", () => {
  it("uses explicit kind before name heuristics", () => {
    assert.equal(rabKind({ name: "Overhead kantor", kind: "langsung" }), "langsung");
    assert.equal(rabKind({ name: "Overhead lapangan" }), "tidak-langsung");
  });
});

describe("workShares", () => {
  it("sums to about 1 across the project duration", () => {
    const shares = workShares(sampleProject());
    const sum = shares.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9);
    assert.equal(shares.length, projectDuration(sampleProject()));
  });
});

describe("ownerPay / dppOf", () => {
  it("splits gross into cash after PPh and PPN bits", () => {
    const gross = 111_000_000;
    const pay = ownerPay(gross, DEFAULT_COMPANY);
    const dpp = dppOf(gross, DEFAULT_COMPANY.ppnRate);
    assert.ok(Math.abs(pay.dpp - dpp) < 1);
    assert.ok(Math.abs(pay.pph - dpp * DEFAULT_COMPANY.pphRate) < 1);
    assert.ok(Math.abs(pay.cash - (gross - pay.pph)) < 1);
    assert.ok(Math.abs(pay.ppn - (gross - dpp)) < 1);
  });

  it("returns zeros for non-positive gross", () => {
    assert.deepEqual(ownerPay(0, DEFAULT_COMPANY), { cash: 0, dpp: 0, pph: 0, ppn: 0 });
  });
});

describe("cropActiveWeeks", () => {
  it("keeps a pad around live cash weeks", () => {
    const weeks = Array.from({ length: 20 }, (_, week) => ({
      week,
      cashIn: week === 5 ? 1_000 : 0,
      cashOut: week === 10 ? 500 : 0,
      revenue: 0,
      expense: 0,
    })) as WeekPoint[];
    const cropped = cropActiveWeeks(weeks, 1);
    assert.equal(cropped[0]?.week, 4);
    assert.equal(cropped[cropped.length - 1]?.week, 11);
  });
});

describe("applyStartPreset", () => {
  it("staggers starts for bergelombang", () => {
    const projects = applyStartPreset(satuPasarProjects(), "bergelombang");
    assert.deepEqual(
      projects.map((p) => p.startWeek),
      [6, 16, 28],
    );
  });
});

describe("simulate", () => {
  it("returns a full horizon with matching week labels count", () => {
    const company: Company = { ...DEFAULT_COMPANY, horizonWeeks: 40 };
    const sim = simulate(company, [sampleProject()]);
    assert.equal(sim.weeks.length, 40);
    assert.ok(["hijau", "kuning", "merah"].includes(sim.zone));
    assert.equal(sim.projects.length, 1);
    assert.ok(Number.isFinite(sim.income.netProfit));
    assert.ok(sim.loanLimit === company.loanLimit);
  });

  it("keeps a disabled project out of cash totals", () => {
    const on = sampleProject();
    const off = { ...on, id: "off", enabled: false };
    const withOff = simulate(DEFAULT_COMPANY, [on, off]);
    const alone = simulate(DEFAULT_COMPANY, [on]);
    assert.equal(Math.round(withOff.totalCashIn), Math.round(alone.totalCashIn));
    assert.equal(Math.round(withOff.peakLoan), Math.round(alone.peakLoan));
  });

  it("raises peak loan when equity is near zero", () => {
    const rich = simulate({ ...DEFAULT_COMPANY, cashStart: 200_000_000, projectShare: 1 }, [
      sampleProject(),
    ]);
    const poor = simulate({ ...DEFAULT_COMPANY, cashStart: 5_000_000, projectShare: 1 }, [
      sampleProject(),
    ]);
    assert.ok(poor.peakLoan >= rich.peakLoan);
  });
});
