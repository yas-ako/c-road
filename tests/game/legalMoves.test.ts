import { describe, expect, it } from "vitest";

import { setCell } from "../../src/game/board";
import { townConnectionGame } from "../../src/game/modes/townConnection/game";
import { windingCycleGame } from "../../src/game/modes/windingCycle/game";
import {
  createTownConnectionInitialState,
  createWindingCycleInitialState,
  type WindingCycleGameState,
} from "../../src/game/state";

describe("legal move generation", () => {
  it("街の配置候補を合法手として返す", () => {
    const moves = townConnectionGame.getLegalMoves(
      createTownConnectionInitialState(),
    );

    expect(moves).toHaveLength(4);
    expect(moves.every((move) => move.type === "extend-town")).toBe(true);
    expect(
      moves.every(
        (move) =>
          townConnectionGame.validateMove(
            createTownConnectionInitialState(),
            move,
          ).valid,
      ),
    ).toBe(true);
  });

  it("空の盤面では全169マスの道路番号1を返す", () => {
    const moves = windingCycleGame.getLegalMoves(
      createWindingCycleInitialState(),
    );

    expect(moves).toHaveLength(169);
    expect(moves.every((move) => move.level === 1)).toBe(true);
    expect(
      moves.every(
        (move) =>
          windingCycleGame.validateMove(createWindingCycleInitialState(), move)
            .valid,
      ),
    ).toBe(true);
  });

  it("2と3で二重に挟まれたマスには道路番号1と2を返す", () => {
    const initial = createWindingCycleInitialState();
    let board = initial.board;
    for (const [coordinate, level] of [
      [{ x: 5, y: 6 }, 2],
      [{ x: 7, y: 6 }, 2],
      [{ x: 6, y: 5 }, 3],
      [{ x: 6, y: 7 }, 3],
    ] as const) {
      board = setCell(board, coordinate, {
        kind: "road",
        color: "blue",
        level,
      });
    }
    const state: WindingCycleGameState = { ...initial, board };

    expect(
      windingCycleGame
        .getLegalMoves(state)
        .filter(({ coordinate }) => coordinate.x === 6 && coordinate.y === 6)
        .map(({ level }) => level),
    ).toEqual([1, 2]);
  });
});
