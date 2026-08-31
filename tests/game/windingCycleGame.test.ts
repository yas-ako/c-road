import { describe, expect, it } from "vitest";

import { getCell, setCell } from "../../src/game/board";
import { windingCycleGame } from "../../src/game/modes/windingCycle/game";
import type { WindingCycleGameState } from "../../src/game/state";
import { BOARD_SIZE } from "../../src/game/types";

function stateWithBoard(
  board: WindingCycleGameState["board"],
): WindingCycleGameState {
  return { ...windingCycleGame.createInitialState(), board };
}

describe("windingCycleGame", () => {
  it("街のない空盤面から道路配置を開始する", () => {
    const state = windingCycleGame.createInitialState();

    expect(state.mode).toBe("winding-cycle");
    expect(state.phase).toBe("placing-roads");
    expect(state.currentPlayer).toBe("blue");
    expect(windingCycleGame.getLegalMoves(state)).toHaveLength(169);
  });

  it("最後の道を置いて左右の周回路を完成する", () => {
    const initial = windingCycleGame.createInitialState();
    let board = initial.board;
    for (let x = 0; x < BOARD_SIZE - 1; x++) {
      board = setCell(
        board,
        { x, y: 6 },
        {
          kind: "road",
          color: "blue",
          level: 1,
        },
      );
    }
    const state = stateWithBoard(board);

    const result = windingCycleGame.applyMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: BOARD_SIZE - 1, y: 6 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result?.type).toBe("win");
    expect(result.state.result?.condition).toBe("winding-cycle");
    if (result.state.result?.condition !== "winding-cycle") return;
    expect(result.state.result.winding).toEqual({ x: 1, y: 0 });
    expect(result.state.currentPlayer).toBe("blue");
  });

  it("配置した道が取り壊された場合は周回路の勝利にしない", () => {
    const initial = windingCycleGame.createInitialState();
    let board = initial.board;
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (x === 6) continue;
      board = setCell(
        board,
        { x, y: 6 },
        {
          kind: "road",
          color: "blue",
          level: 1,
        },
      );
    }
    for (const coordinate of [
      { x: 6, y: 5 },
      { x: 6, y: 7 },
    ]) {
      board = setCell(board, coordinate, {
        kind: "road",
        color: "red",
        level: 2,
      });
    }
    const state = stateWithBoard(board);

    const result = windingCycleGame.applyMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 6, y: 6 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result).toBeNull();
    expect(result.state.currentPlayer).toBe("red");
    expect(getCell(result.state.board, { x: 6, y: 6 })).toEqual({
      kind: "empty",
    });
    expect(result.events[0]?.removedCells).toContainEqual({ x: 6, y: 6 });
  });

  it("配置によって一旦周回しても、既存の道が同時に取り壊されれば勝利にしない", () => {
    const initial = windingCycleGame.createInitialState();
    let board = initial.board;
    for (let x = 0; x < BOARD_SIZE - 1; x++) {
      board = setCell(
        board,
        { x, y: 6 },
        {
          kind: "road",
          color: "blue",
          level: x === 0 || x === 5 ? 2 : 1,
        },
      );
    }
    const state = stateWithBoard(board);

    const result = windingCycleGame.applyMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: BOARD_SIZE - 1, y: 6 },
      level: 2,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result).toBeNull();
    expect(result.events[0]?.removedCells).toContainEqual({ x: 6, y: 6 });
    expect(getCell(result.state.board, { x: 6, y: 6 })).toEqual({
      kind: "empty",
    });
  });

  it("盤面に空きがなく勝者もいない場合は引き分けにする", () => {
    const initial = windingCycleGame.createInitialState();
    let board = initial.board;
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (x === 0 && y === 0) continue;
        board = setCell(
          board,
          { x, y },
          {
            kind: "road",
            color: "red",
            level: 3 * (x * BOARD_SIZE + y + 1),
          },
        );
      }
    }
    const state = stateWithBoard(board);

    const result = windingCycleGame.applyMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 0, y: 0 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result).toEqual({
      type: "draw",
      reason: "no-legal-moves",
    });
  });

  it("投了したプレイヤーの相手を勝者にする", () => {
    const state = windingCycleGame.createInitialState();
    const result = windingCycleGame.resign(state, "blue");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result).toEqual({
      type: "win",
      condition: "resignation",
      winner: "red",
      resignedPlayer: "blue",
    });
    expect(windingCycleGame.getLegalMoves(result.state)).toEqual([]);
    expect(
      windingCycleGame.applyMove(result.state, {
        type: "place-road",
        player: "blue",
        coordinate: { x: 0, y: 0 },
        level: 1,
      }),
    ).toMatchObject({ success: false, reason: "game-is-over" });
    expect(windingCycleGame.resign(result.state, "red")).toMatchObject({
      success: false,
      reason: "game-is-over",
    });
  });
});
