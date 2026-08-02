import { describe, expect, it } from "vitest";
import { SnapEngine } from "../src/engine/SnapEngine";

describe("SnapEngine", () => {
  it("encaixa um ponto na grade", () => {
    const snap = new SnapEngine(20, true);
    expect(snap.snap({ x: 29, y: 51 })).toEqual({ x: 20, y: 60 });
  });

  it("preserva o ponto quando desativado", () => {
    const snap = new SnapEngine(20, false);
    expect(snap.snap({ x: 29, y: 51 })).toEqual({ x: 29, y: 51 });
  });
});
