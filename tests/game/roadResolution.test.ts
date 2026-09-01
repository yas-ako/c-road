import { describe, expect, it } from "vitest";

import { createEmptyBoard, getCell, setCell } from "../../src/game/board";
import { resolveRoadPlacement } from "../../src/game/roadResolution";

describe("resolveRoadPlacement", () => {
  it("配置直後の同じ盤面から全対象を求め、重複を除いて同時に取り壊す", () => {
    let board = createEmptyBoard();
    for (const [x, y, level] of [
      [4, 6, 3],
      [5, 6, 2],
      [7, 6, 2],
      [8, 6, 3],
      [6, 4, 3],
      [6, 5, 2],
      [6, 7, 2],
      [6, 8, 3],
    ] as const) {
      board = setCell(board, { x, y }, { kind: "road", color: "red", level });
    }

    const resolution = resolveRoadPlacement(board, {
      coordinate: { x: 6, y: 6 },
      color: "blue",
      level: 2,
    });

    expect(resolution.removedCells).toEqual([
      { x: 5, y: 6 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 6, y: 7 },
      { x: 7, y: 6 },
    ]);
    expect(getCell(resolution.boardBeforeDemolition, { x: 6, y: 6 })).toEqual({
      kind: "road",
      color: "blue",
      level: 2,
    });
    expect(getCell(resolution.board, { x: 6, y: 6 })).toEqual({
      kind: "empty",
    });
    expect(getCell(board, { x: 6, y: 6 })).toEqual({ kind: "empty" });
  });
});
