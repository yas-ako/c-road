import { describe, expect, it } from "vitest";

import { getTownOverlays } from "../../src/components/board/townOverlay";
import { setCell } from "../../src/game/board";
import { createTownConnectionInitialState } from "../../src/game/state";

describe("getTownOverlays", () => {
  it("未完成の街を1マスの図形として配置する", () => {
    expect(getTownOverlays(createTownConnectionInitialState().board)).toEqual([
      {
        townId: "north-west",
        column: 4,
        row: 4,
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        townId: "south-east",
        column: 12,
        row: 12,
        columnSpan: 1,
        rowSpan: 1,
      },
    ]);
  });

  it("横向きの街を1つの2×1図形として配置する", () => {
    const initial = createTownConnectionInitialState();
    const board = setCell(
      initial.board,
      { x: 3, y: 2 },
      {
        kind: "town",
        townId: "north-west",
      },
    );

    expect(getTownOverlays(board)[0]).toEqual({
      townId: "north-west",
      column: 4,
      row: 4,
      columnSpan: 2,
      rowSpan: 1,
    });
  });

  it("縦向きの街を1つの1×2図形として配置する", () => {
    const initial = createTownConnectionInitialState();
    const board = setCell(
      initial.board,
      { x: 2, y: 3 },
      {
        kind: "town",
        townId: "north-west",
      },
    );

    expect(getTownOverlays(board)[0]).toEqual({
      townId: "north-west",
      column: 4,
      row: 4,
      columnSpan: 1,
      rowSpan: 2,
    });
  });
});
