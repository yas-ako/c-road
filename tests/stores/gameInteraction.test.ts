import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { getCell } from "../../src/game/board";
import { useGameStore } from "../../src/stores/game";
import { useGameInteractionStore } from "../../src/stores/gameInteraction";

describe("game interaction store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function finishTownSetup() {
    const interaction = useGameInteractionStore();
    interaction.selectCell(3, 2);
    interaction.selectCell(9, 10);
  }

  it("街の候補だけを受け付け、青、赤の順で配置する", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();

    expect(interaction.activeTownId).toBe("north-west");
    expect(interaction.isTownCandidate(3, 2)).toBe(true);
    interaction.selectCell(3, 3);
    expect(game.state.phase).toBe("placing-north-west-town");

    interaction.selectCell(3, 2);
    expect(game.state.phase).toBe("placing-south-east-town");
    expect(interaction.activeTownId).toBe("south-east");

    interaction.selectCell(9, 10);
    expect(game.state.phase).toBe("placing-roads");
    expect(interaction.activeTownId).toBeUndefined();
  });

  it("選択したマスの配置上限を取得する", () => {
    const interaction = useGameInteractionStore();
    finishTownSetup();

    interaction.selectCell(3, 4);

    expect(interaction.selectedCell).toEqual([3, 4]);
    expect(interaction.maxCellNumber).toBe(1);
    expect(interaction.isEditable).toBe(true);
  });

  it("選択したマスへ道を配置して選択を解除する", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();
    finishTownSetup();
    interaction.selectCell(3, 4);

    expect(interaction.submitMove(1)).toBe(true);

    expect(getCell(game.state.board, { x: 3, y: 4 })).toEqual({
      kind: "road",
      color: "blue",
      level: 1,
    });
    expect(interaction.selectedCell).toEqual([-1, -1]);
    expect(interaction.isEditable).toBe(false);
  });

  it("UI状態だけをリセットする", () => {
    const interaction = useGameInteractionStore();
    finishTownSetup();
    interaction.selectCell(3, 4);

    interaction.reset();

    expect(interaction.selectedCell).toEqual([-1, -1]);
    expect(interaction.maxCellNumber).toBe(10);
  });
});
