import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useGameSession } from "../../src/composables/useGameSession";
import { getCell } from "../../src/game/board";
import { useGameStore } from "../../src/stores/game";
import { useGameInteractionStore } from "../../src/stores/gameInteraction";
import { useGamePresentationStore } from "../../src/stores/gamePresentation";

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

  it("周回形式では街配置を行わず、最初から道を選択する", () => {
    const interaction = useGameInteractionStore();
    const session = useGameSession();
    session.startGame("winding-cycle");

    expect(interaction.activeTownId).toBeUndefined();
    expect(interaction.townCandidates).toEqual([]);

    interaction.selectCell(3, 4);

    expect(interaction.selectedCell).toEqual([3, 4]);
    expect(interaction.isEditable).toBe(true);
  });

  it("投了確認を経て現在のプレイヤーを投了させる", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();

    expect(interaction.requestResignation()).toBe(true);
    expect(interaction.isResignationConfirmationOpen).toBe(true);
    expect(interaction.confirmResignation()).toBe(true);
    expect(interaction.isResignationConfirmationOpen).toBe(false);
    expect(game.state.result).toEqual({
      type: "win",
      condition: "resignation",
      winner: "red",
      resignedPlayer: "blue",
    });
  });

  it("投了確認をキャンセルできる", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();

    interaction.requestResignation();
    interaction.cancelResignation();

    expect(interaction.isResignationConfirmationOpen).toBe(false);
    expect(game.state.result).toBeNull();
  });

  it("投了確認後に局面が進んだ場合は投了させない", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();

    interaction.requestResignation();
    game.extendTown("north-west", { x: 3, y: 2 });

    expect(interaction.resigningPlayer).toBe("blue");
    expect(game.state.currentPlayer).toBe("red");
    expect(interaction.confirmResignation()).toBe(false);
    expect(interaction.isResignationConfirmationOpen).toBe(false);
    expect(game.state.result).toBeNull();
  });

  it("取り壊し演出中は投了確認を開始・確定しない", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();
    const presentation = useGamePresentationStore();

    presentation.isBeingRemoved = true;
    expect(interaction.requestResignation()).toBe(false);

    presentation.isBeingRemoved = false;
    interaction.requestResignation();
    presentation.isBeingRemoved = true;

    expect(interaction.confirmResignation()).toBe(false);
    expect(interaction.isResignationConfirmationOpen).toBe(false);
    expect(game.state.result).toBeNull();
  });

  it("UI状態だけをリセットする", () => {
    const interaction = useGameInteractionStore();
    finishTownSetup();
    interaction.selectCell(3, 4);

    interaction.reset();

    expect(interaction.selectedCell).toEqual([-1, -1]);
    expect(interaction.maxCellNumber).toBe(10);
    expect(interaction.isResignationConfirmationOpen).toBe(false);
  });
});
