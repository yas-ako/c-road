import { describe, expect, it } from "vitest";

import { cellX, cellY, isInEdge } from "../src/composables/useCellCoords";

describe("cellX / cellY", () => {
  it.each([
    { tile: 0, coordinate: [12, 12] },
    { tile: 14, coordinate: [0, 12] },
    { tile: 16, coordinate: [0, 0] },
    { tile: 28, coordinate: [12, 0] },
    { tile: 196, coordinate: [0, 12] },
    { tile: 210, coordinate: [12, 0] },
    { tile: 224, coordinate: [0, 0] },
  ])("表示タイル $tile を論理座標へ変換する", ({ tile, coordinate }) => {
    expect([cellX(tile), cellY(tile)]).toEqual(coordinate);
  });
});

describe("isInEdge", () => {
  it.each([0, 7, 14, 15, 29, 105, 119, 210, 217, 224])(
    "外周タイル %i を判定する",
    (tile) => {
      expect(isInEdge(tile)).toBe(true);
    },
  );

  it.each([16, 28, 112, 196, 208])("内側タイル %i を判定する", (tile) => {
    expect(isInEdge(tile)).toBe(false);
  });
});
