import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Contract for persist + StatsBeacon: no journal/view writes until rehydrate
 * finished. Mirrors the gate in store-provider / stats-beacon.
 */
export function mayWritePersistedJournal(hasHydrated: boolean): boolean {
  return hasHydrated === true;
}

describe("mayWritePersistedJournal", () => {
  it("blocks writes before hydration", () => {
    assert.equal(mayWritePersistedJournal(false), false);
  });

  it("allows writes only after hasHydrated is true", () => {
    assert.equal(mayWritePersistedJournal(true), true);
  });
});
