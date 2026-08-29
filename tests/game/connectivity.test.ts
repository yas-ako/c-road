import { describe, expect, it } from "vitest";

import { areRoadsConnected } from "../../src/game/rules/connectivity";
import type { Cell } from "../../src/game/types";

const blue = (level: number): Cell => ({ kind: "road", color: "blue", level });
const red = (level: number): Cell => ({ kind: "road", color: "red", level });

describe("areRoadsConnected", () => {
  it.each([
    [blue(2), blue(1), true],
    [blue(2), blue(2), true],
    [blue(2), blue(3), true],
    [blue(2), blue(4), false],
    [blue(2), red(2), false],
    [blue(2), { kind: "empty" } as const, false],
    [blue(2), { kind: "town", townId: "north-west" } as const, false],
  ])("2つのセルの道路接続を判定する", (first, second, expected) => {
    expect(areRoadsConnected(first, second)).toBe(expected);
  });
});
