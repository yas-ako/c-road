import { describe, expect, it } from "vitest";

import {
  applyGameMove,
  applyResignation,
  createGameState,
  type GameMode,
} from "../../src/game/gameModes";

describe("game mode dispatch", () => {
  it.each([
    ["town-connection", "placing-north-west-town"],
    ["winding-cycle", "placing-roads"],
  ] as const)("%s の初期局面を生成する", (mode, phase) => {
    const state = createGameState(mode);

    expect(state.mode).toBe(mode);
    expect(state.phase).toBe(phase);
    expect(state.currentPlayer).toBe("blue");
    expect(state.result).toBeNull();
  });

  it("局面のモードに対応するエンジンで手を適用する", () => {
    const state = createGameState("winding-cycle");
    const result = applyGameMove(state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 6, y: 6 },
      level: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.state.mode).toBe("winding-cycle");
    expect(result.state.currentPlayer).toBe("red");
  });

  it("周回形式では街の配置を拒否する", () => {
    const state = createGameState("winding-cycle");

    expect(
      applyGameMove(state, {
        type: "extend-town",
        player: "blue",
        townId: "north-west",
        coordinate: { x: 3, y: 2 },
      }),
    ).toEqual({
      success: false,
      state,
      reason: "wrong-phase",
    });
  });

  it.each(["town-connection", "winding-cycle"] satisfies readonly GameMode[])(
    "%s で投了を処理する",
    (mode) => {
      const state = createGameState(mode);
      const result = applyResignation(state, "blue");

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.state.mode).toBe(mode);
      expect(result.state.result).toEqual({
        type: "win",
        condition: "resignation",
        winner: "red",
        resignedPlayer: "blue",
      });
    },
  );
});
