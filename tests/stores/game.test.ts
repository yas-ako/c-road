import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { getCell, setCell } from "../../src/game/board";
import { createTownConnectionInitialState } from "../../src/game/state";
import { useGameStore } from "../../src/stores/game";
import { createTownRoadState } from "../helpers/gameState";

describe("game store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("ゲームエンジンの初期局面を保持する", () => {
    const game = useGameStore();

    expect(game.state).toEqual(createTownConnectionInitialState());
  });

  it("青、赤の順に街を完成させる", () => {
    const game = useGameStore();

    expect(game.extendTown("north-west", { x: 3, y: 2 })).toBe(true);
    expect(game.extendTown("south-east", { x: 9, y: 10 })).toBe(true);

    expect(game.state.phase).toBe("placing-roads");
    expect(game.state.currentPlayer).toBe("blue");
  });

  it("道を配置し、発生したイベントを返す", () => {
    const game = useGameStore();
    game.state = createTownRoadState();

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
    const initial = createTownRoadState();
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

  it("現在の手番のプレイヤーが投了する", () => {
    const game = useGameStore();

    expect(game.resign()).toBe(true);
    expect(game.state.result).toEqual({
      type: "win",
      condition: "resignation",
      winner: "red",
      resignedPlayer: "blue",
    });
  });

  it("リセットすると初期局面へ戻る", () => {
    const game = useGameStore();
    game.extendTown("north-west", { x: 3, y: 2 });

    game.reset();

    expect(game.state).toEqual(createTownConnectionInitialState());
  });
});
