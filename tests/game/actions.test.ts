import { describe, expect, it } from "vitest";

import { applyAction, validateAction } from "../../src/game/actions";
import { getCell, setCell } from "../../src/game/board";
import {
  createInitialGameState,
  createTownSetupGameState,
} from "../../src/game/state";
import type { GameState } from "../../src/game/state";

function stateWithBoard(board: GameState["board"]): GameState {
  return {
    ...createInitialGameState(),
    board,
  };
}

describe("validateAction", () => {
  it("空の盤面では青が道路番号1を置ける", () => {
    expect(
      validateAction(createInitialGameState(), {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 1,
      }),
    ).toEqual({ valid: true });
  });

  it.each([
    {
      name: "手番外",
      action: {
        type: "place-road" as const,
        player: "red" as const,
        coordinate: { x: 6, y: 6 },
        level: 1,
      },
      reason: "wrong-player",
    },
    {
      name: "盤面外",
      action: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: -1, y: 6 },
        level: 1,
      },
      reason: "invalid-coordinate",
    },
    {
      name: "小数座標",
      action: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 1.5, y: 6 },
        level: 1,
      },
      reason: "invalid-coordinate",
    },
    {
      name: "道路番号0",
      action: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 0,
      },
      reason: "invalid-road-level",
    },
    {
      name: "小数の道路番号",
      action: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 1.5,
      },
      reason: "invalid-road-level",
    },
    {
      name: "上限超過",
      action: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 2,
      },
      reason: "road-level-exceeds-limit",
    },
  ])("$name を拒否する", ({ action, reason }) => {
    expect(validateAction(createInitialGameState(), action)).toEqual({
      valid: false,
      reason,
    });
  });

  it.each([
    {
      name: "既存道路",
      occupiedCell: { kind: "road", color: "blue", level: 1 } as const,
    },
    {
      name: "街",
      occupiedCell: { kind: "town", townId: "north-west" } as const,
    },
  ])("$name への上書きを拒否する", ({ occupiedCell }) => {
    const initial = createInitialGameState();
    const state = stateWithBoard(
      setCell(initial.board, { x: 6, y: 6 }, occupiedCell),
    );

    expect(
      validateAction(state, {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 1,
      }),
    ).toEqual({ valid: false, reason: "cell-is-not-empty" });
  });
});

describe("applyAction", () => {
  it("道路を配置して手番とターンを進める", () => {
    const initial = createInitialGameState();
    const result = applyAction(initial, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 6, y: 6 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(getCell(result.state.board, { x: 6, y: 6 })).toEqual({
      kind: "road",
      color: "blue",
      level: 1,
    });
    expect(result.state.currentPlayer).toBe("red");
    expect(result.state.turn).toBe(1);
    expect(result.events).toEqual([]);
    expect(getCell(initial.board, { x: 6, y: 6 })).toEqual({ kind: "empty" });
  });

  it("不正な操作では同じ局面を返す", () => {
    const initial = createInitialGameState();
    const result = applyAction(initial, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 6, y: 6 },
      level: 2,
    });

    expect(result).toEqual({
      success: false,
      state: initial,
      reason: "road-level-exceeds-limit",
    });
  });

  it("勝利後の操作を拒否する", () => {
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      winResult: {
        winner: "blue",
        roadPath: [{ x: 3, y: 3 }],
        townConnections: [
          { townId: "north-west", roadCell: { x: 3, y: 3 } },
          { townId: "south-east", roadCell: { x: 3, y: 3 } },
        ],
      },
    };

    expect(
      validateAction(state, {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 1,
      }),
    ).toEqual({ valid: false, reason: "game-is-over" });
  });

  it("取り壊しを反映し、演出用の取り壊し前盤面を返す", () => {
    const initial = createInitialGameState();
    let board = setCell(
      initial.board,
      { x: 2, y: 6 },
      {
        kind: "road",
        color: "blue",
        level: 3,
      },
    );
    board = setCell(
      board,
      { x: 3, y: 6 },
      {
        kind: "road",
        color: "red",
        level: 2,
      },
    );
    const state = stateWithBoard(board);

    const result = applyAction(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 4, y: 6 },
      level: 3,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.events).toHaveLength(1);
    const event = result.events[0];
    expect(event).toBeDefined();
    if (event === undefined) return;

    expect(event.type).toBe("demolition");
    expect(event.removedCells).toEqual([{ x: 3, y: 6 }]);
    expect(getCell(event.boardBeforeDemolition, { x: 3, y: 6 })).toEqual({
      kind: "road",
      color: "red",
      level: 2,
    });
    expect(getCell(result.state.board, { x: 3, y: 6 })).toEqual({
      kind: "empty",
    });
    expect(getCell(state.board, { x: 4, y: 6 })).toEqual({ kind: "empty" });
  });

  it("取り壊し後の盤面で勝利を確定し、手番を維持する", () => {
    const initial = createTownSetupGameState();
    let board = setCell(
      setCell(
        initial.board,
        { x: 3, y: 2 },
        {
          kind: "town",
          townId: "north-west",
        },
      ),
      { x: 9, y: 10 },
      { kind: "town", townId: "south-east" },
    );
    for (let value = 3; value <= 8; value++) {
      board = setCell(
        board,
        { x: value, y: value },
        {
          kind: "road",
          color: "blue",
          level: 1,
        },
      );
    }
    const state: GameState = {
      ...initial,
      board,
      phase: "placing-roads",
    };

    const result = applyAction(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 9, y: 9 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.winResult?.winner).toBe("blue");
    expect(result.state.winResult?.roadPath).toEqual(
      Array.from({ length: 7 }, (_, index) => ({
        x: index + 3,
        y: index + 3,
      })),
    );
    expect(result.state.currentPlayer).toBe("blue");
    expect(result.state.turn).toBe(1);
  });

  it("配置直後に街がつながっても、経路が取り壊されれば勝利にしない", () => {
    const initial = createTownSetupGameState();
    let board = setCell(
      setCell(
        initial.board,
        { x: 3, y: 2 },
        { kind: "town", townId: "north-west" },
      ),
      { x: 9, y: 10 },
      { kind: "town", townId: "south-east" },
    );
    for (const coordinate of [
      { x: 3, y: 3 },
      { x: 6, y: 6 },
      { x: 7, y: 7 },
      { x: 8, y: 8 },
      { x: 9, y: 9 },
    ]) {
      board = setCell(board, coordinate, {
        kind: "road",
        color: "blue",
        level: 2,
      });
    }
    board = setCell(
      board,
      { x: 4, y: 4 },
      {
        kind: "road",
        color: "blue",
        level: 1,
      },
    );
    const state: GameState = {
      ...initial,
      board,
      phase: "placing-roads",
    };

    const result = applyAction(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 5, y: 5 },
      level: 2,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.winResult).toBeNull();
    expect(result.state.currentPlayer).toBe("red");
    expect(getCell(result.state.board, { x: 4, y: 4 })).toEqual({
      kind: "empty",
    });
  });
});
