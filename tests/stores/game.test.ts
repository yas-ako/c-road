import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCell, setCell } from "../../src/game/board";
import { createInitialGameState } from "../../src/game/state";
import { useGameStore } from "../../src/stores/game";

describe("game store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("新しいゲーム状態の盤面を表示する", () => {
    const game = useGameStore();

    expect(game.state.currentPlayer).toBe("blue");
    expect(getCell(game.displayBoard, { x: 0, y: 0 })).toEqual({
      kind: "empty",
    });
  });

  it("配置上限をゲームエンジンから取得する", () => {
    const game = useGameStore();

    game.selectCell(3, 4);

    expect(game.selectedCell).toEqual([3, 4]);
    expect(game.maxCellNumber).toBe(1);
  });

  it("道を配置して手番と表示盤面を更新する", () => {
    const game = useGameStore();

    game.selectCell(3, 4);
    game.submitMove(1);

    expect(getCell(game.state.board, { x: 3, y: 4 })).toEqual({
      kind: "road",
      color: "blue",
      level: 1,
    });
    expect(getCell(game.displayBoard, { x: 3, y: 4 })).toEqual({
      kind: "road",
      color: "blue",
      level: 1,
    });
    expect(game.state.currentPlayer).toBe("red");
  });

  it("取り壊し前の盤面を表示し、時間経過後に確定盤面へ戻す", () => {
    const game = useGameStore();
    const initial = createInitialGameState();
    const withRoads = setCell(
      setCell(
        initial.board,
        { x: 2, y: 6 },
        {
          kind: "road",
          color: "red",
          level: 3,
        },
      ),
      { x: 3, y: 6 },
      { kind: "road", color: "red", level: 2 },
    );
    game.state = { ...initial, board: withRoads, currentPlayer: "red" };

    game.selectCell(4, 6);
    game.submitMove(3);

    expect(game.isBeingRemoved).toBe(true);
    expect(getCell(game.state.board, { x: 3, y: 6 })).toEqual({
      kind: "empty",
    });
    expect(getCell(game.displayBoard, { x: 3, y: 6 })).toEqual({
      kind: "road",
      color: "red",
      level: 2,
    });

    vi.advanceTimersByTime(2000);

    expect(game.isBeingRemoved).toBe(false);
    expect(getCell(game.displayBoard, { x: 3, y: 6 })).toEqual({
      kind: "empty",
    });
  });

  it("リセットすると初期状態へ戻る", () => {
    const game = useGameStore();
    game.selectCell(3, 4);
    game.submitMove(1);

    game.reset();

    expect(game.state).toEqual(createInitialGameState());
    expect(game.selectedCell).toEqual([-1, -1]);
    expect(game.isBeingRemoved).toBe(false);
  });
});
