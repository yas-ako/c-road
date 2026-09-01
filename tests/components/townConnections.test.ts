import { describe, expect, it } from "vitest";

import {
  chooseDisplayedTownCell,
  getDisplayedTownConnections,
} from "../../src/components/board/townConnections";
import { setCell } from "../../src/game/board";
import { createTownConnectionInitialState } from "../../src/game/state";

describe("town connections", () => {
  it("両方の街マスに隣接する道路には辺を共有する側から1本だけ接続する", () => {
    let board = createTownConnectionInitialState().board;
    board = setCell(
      board,
      { x: 3, y: 2 },
      {
        kind: "town",
        townId: "north-west",
      },
    );
    board = setCell(
      board,
      { x: 3, y: 1 },
      {
        kind: "road",
        color: "blue",
        level: 1,
      },
    );

    expect(
      chooseDisplayedTownCell(board, "north-west", { x: 3, y: 1 }),
    ).toEqual({ x: 3, y: 2 });
    expect(getDisplayedTownConnections(board)).toEqual([
      {
        townId: "north-west",
        townCell: { x: 3, y: 2 },
        roadCell: { x: 3, y: 1 },
        color: "blue",
      },
    ]);
  });

  it("異なる道路は同じ街にそれぞれ1本ずつ接続する", () => {
    let board = createTownConnectionInitialState().board;
    board = setCell(
      board,
      { x: 3, y: 2 },
      {
        kind: "town",
        townId: "north-west",
      },
    );
    board = setCell(
      board,
      { x: 1, y: 2 },
      {
        kind: "road",
        color: "red",
        level: 1,
      },
    );
    board = setCell(
      board,
      { x: 2, y: 1 },
      {
        kind: "road",
        color: "blue",
        level: 4,
      },
    );

    expect(getDisplayedTownConnections(board)).toHaveLength(2);
  });
});
