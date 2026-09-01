import { describe, expect, it } from "vitest";

import { getCell, setCell } from "../../src/game/board";
import { townConnectionGame } from "../../src/game/modes/townConnection/game";
import {
  createTownConnectionInitialState,
  type TownConnectionGameState,
} from "../../src/game/state";
import { createTownRoadState } from "../helpers/gameState";

function stateWithBoard(
  board: TownConnectionGameState["board"],
): TownConnectionGameState {
  return {
    ...createTownRoadState(),
    board,
  };
}

describe("townConnectionGame.validateMove", () => {
  it("空の盤面では青が道路番号1を置ける", () => {
    expect(
      townConnectionGame.validateMove(createTownRoadState(), {
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
      move: {
        type: "place-road" as const,
        player: "red" as const,
        coordinate: { x: 6, y: 6 },
        level: 1,
      },
      reason: "wrong-player",
    },
    {
      name: "盤面外",
      move: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: -1, y: 6 },
        level: 1,
      },
      reason: "invalid-coordinate",
    },
    {
      name: "小数座標",
      move: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 1.5, y: 6 },
        level: 1,
      },
      reason: "invalid-coordinate",
    },
    {
      name: "道路番号0",
      move: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 0,
      },
      reason: "invalid-road-level",
    },
    {
      name: "小数の道路番号",
      move: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 1.5,
      },
      reason: "invalid-road-level",
    },
    {
      name: "上限超過",
      move: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 2,
      },
      reason: "road-level-exceeds-limit",
    },
  ])("$name を拒否する", ({ move, reason }) => {
    expect(
      townConnectionGame.validateMove(createTownRoadState(), move),
    ).toEqual({
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
    const initial = createTownRoadState();
    const state = stateWithBoard(
      setCell(initial.board, { x: 6, y: 6 }, occupiedCell),
    );

    expect(
      townConnectionGame.validateMove(state, {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 1,
      }),
    ).toEqual({ valid: false, reason: "cell-is-not-empty" });
  });
});

describe("townConnectionGame.applyMove", () => {
  it("道路を配置して手番とターンを進める", () => {
    const initial = createTownRoadState();
    const result = townConnectionGame.applyMove(initial, {
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
    const initial = createTownRoadState();
    const result = townConnectionGame.applyMove(initial, {
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
    const initial = createTownRoadState();
    const state: TownConnectionGameState = {
      ...initial,
      result: {
        type: "win",
        condition: "town-connection",
        winner: "blue",
        roadPath: [{ x: 3, y: 3 }],
        townConnections: [
          { townId: "north-west", roadCell: { x: 3, y: 3 } },
          { townId: "south-east", roadCell: { x: 3, y: 3 } },
        ],
      },
    };

    expect(
      townConnectionGame.validateMove(state, {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 1,
      }),
    ).toEqual({ valid: false, reason: "game-is-over" });
  });

  it("取り壊しを反映し、演出用の取り壊し前盤面を返す", () => {
    const initial = createTownRoadState();
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

    const result = townConnectionGame.applyMove(state, {
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
    const initial = createTownConnectionInitialState();
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
    const state: TownConnectionGameState = {
      ...initial,
      board,
      phase: "placing-roads",
    };

    const result = townConnectionGame.applyMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 9, y: 9 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result?.type).toBe("win");
    expect(result.state.result?.condition).toBe("town-connection");
    if (result.state.result?.condition !== "town-connection") return;
    expect(result.state.result.winner).toBe("blue");
    expect(result.state.result.roadPath).toEqual(
      Array.from({ length: 7 }, (_, index) => ({
        x: index + 3,
        y: index + 3,
      })),
    );
    expect(result.state.currentPlayer).toBe("blue");
    expect(result.state.turn).toBe(1);
  });

  it("配置直後に街がつながっても、経路が取り壊されれば勝利にしない", () => {
    const initial = createTownConnectionInitialState();
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
    const state: TownConnectionGameState = {
      ...initial,
      board,
      phase: "placing-roads",
    };

    const result = townConnectionGame.applyMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 5, y: 5 },
      level: 2,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.result).toBeNull();
    expect(result.state.currentPlayer).toBe("red");
    expect(getCell(result.state.board, { x: 4, y: 4 })).toEqual({
      kind: "empty",
    });
  });
});
