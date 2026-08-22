import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { getCell, setCell } from "../../src/game/board";
import { createInitialGameState } from "../../src/game/state";
import { useGameStore } from "../../src/stores/game";

describe("game store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("ゲームエンジンの初期局面を保持する", () => {
    const game = useGameStore();

    expect(game.state).toEqual(createInitialGameState());
  });

  it("道を配置し、発生したイベントを返す", () => {
    const game = useGameStore();

    expect(game.placeRoad({ x: 3, y: 4 }, 1)).toEqual([]);
    expect(getCell(game.state.board, { x: 3, y: 4 })).toEqual({
      kind: "road",
      color: "blue",
      level: 1,
    });
    expect(game.state.currentPlayer).toBe("red");
  });

  it("取り壊しを局面へ即時反映し、演出に必要なイベントを返す", () => {
    const game = useGameStore();
    const initial = createInitialGameState();
    game.state = {
      ...initial,
      currentPlayer: "red",
      board: setCell(
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
      ),
    };

    const events = game.placeRoad({ x: 4, y: 6 }, 3);

    expect(events).toHaveLength(1);
    expect(events?.[0]?.type).toBe("demolition");
    expect(getCell(game.state.board, { x: 3, y: 6 })).toEqual({
      kind: "empty",
    });
  });

  it("リセットすると初期局面へ戻る", () => {
    const game = useGameStore();
    game.placeRoad({ x: 3, y: 4 }, 1);

    game.reset();

    expect(game.state).toEqual(createInitialGameState());
  });
});
