import { describe, expect, it } from "vitest";

import { applyAction, validateAction } from "../../src/game/actions";
import { getCell } from "../../src/game/board";
import { getTownExtensionCandidates } from "../../src/game/rules/townPlacement";
import { createTownSetupGameState } from "../../src/game/state";
import { TOWN_ANCHORS } from "../../src/game/types";

describe("town setup", () => {
  it("左上と右下の固定マスを配置した状態で開始する", () => {
    const state = createTownSetupGameState();

    expect(state.phase).toBe("placing-north-west-town");
    expect(state.currentPlayer).toBe("blue");
    expect(getCell(state.board, TOWN_ANCHORS["north-west"])).toEqual({
      kind: "town",
      townId: "north-west",
    });
    expect(getCell(state.board, TOWN_ANCHORS["south-east"])).toEqual({
      kind: "town",
      townId: "south-east",
    });
  });

  it("固定マスの上下左右を候補として返す", () => {
    expect(
      getTownExtensionCandidates(createTownSetupGameState(), "north-west"),
    ).toEqual([
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ]);
  });

  it("青、赤の順で街を完成させ、道路配置へ移る", () => {
    const initial = createTownSetupGameState();
    const northWest = applyAction(initial, {
      type: "extend-town",
      player: "blue",
      townId: "north-west",
      coordinate: { x: 3, y: 2 },
    });
    expect(northWest.success).toBe(true);
    if (!northWest.success) return;
    expect(northWest.state.phase).toBe("placing-south-east-town");
    expect(northWest.state.currentPlayer).toBe("red");

    const southEast = applyAction(northWest.state, {
      type: "extend-town",
      player: "red",
      townId: "south-east",
      coordinate: { x: 9, y: 10 },
    });
    expect(southEast.success).toBe(true);
    if (!southEast.success) return;
    expect(southEast.state.phase).toBe("placing-roads");
    expect(southEast.state.currentPlayer).toBe("blue");
    expect(southEast.state.turn).toBe(0);
  });

  it.each([
    {
      name: "斜めのマス",
      action: {
        type: "extend-town" as const,
        player: "blue" as const,
        townId: "north-west" as const,
        coordinate: { x: 3, y: 3 },
      },
      reason: "town-cell-is-not-adjacent",
    },
    {
      name: "右下側の街を先に配置",
      action: {
        type: "extend-town" as const,
        player: "blue" as const,
        townId: "south-east" as const,
        coordinate: { x: 9, y: 10 },
      },
      reason: "wrong-town",
    },
    {
      name: "道路を先に配置",
      action: {
        type: "place-road" as const,
        player: "blue" as const,
        coordinate: { x: 6, y: 6 },
        level: 1,
      },
      reason: "wrong-phase",
    },
  ])("$name を拒否する", ({ action, reason }) => {
    expect(validateAction(createTownSetupGameState(), action)).toEqual({
      valid: false,
      reason,
    });
  });
});
