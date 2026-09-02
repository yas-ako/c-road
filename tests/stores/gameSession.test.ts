import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGameSession } from "../../src/composables/useGameSession";
import { createEmptyBoard } from "../../src/game/board";
import type { GameEvent } from "../../src/game/moveTypes";
import {
  createTownConnectionInitialState,
  createWindingCycleInitialState,
} from "../../src/game/state";
import { useGameStore } from "../../src/stores/game";
import { useGameInteractionStore } from "../../src/stores/gameInteraction";
import { useGamePresentationStore } from "../../src/stores/gamePresentation";
import { useNotificationStore } from "../../src/stores/notification";

describe("game session", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ゲームページに属する状態をまとめて初期化する", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();
    const presentation = useGamePresentationStore();
    const notification = useNotificationStore();
    const session = useGameSession();
    const demolitionEvents = [
      {
        type: "demolition",
        boardBeforeDemolition: createEmptyBoard(),
        removedCells: [{ x: 1, y: 1 }],
      },
    ] satisfies readonly GameEvent[];

    interaction.selectCell(3, 2);
    presentation.present(demolitionEvents);

    session.restart();

    expect(game.state).toEqual(createTownConnectionInitialState());
    expect(interaction.selectedCell).toEqual([-1, -1]);
    expect(interaction.maxCellNumber).toBe(10);
    expect(presentation.isBeingRemoved).toBe(false);
    expect(notification.isVisible).toBe(false);
    expect(notification.text).toEqual(["", ""]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("UI状態を破棄して指定した対戦形式を開始する", () => {
    const game = useGameStore();
    const interaction = useGameInteractionStore();
    const notification = useNotificationStore();
    const session = useGameSession();

    interaction.selectCell(3, 2);
    interaction.requestResignation();
    notification.show(0);

    session.startGame("winding-cycle");

    expect(game.state).toEqual(createWindingCycleInitialState());
    expect(interaction.selectedCell).toEqual([-1, -1]);
    expect(interaction.isResignationConfirmationOpen).toBe(false);
    expect(notification.isVisible).toBe(false);
  });

  it("同じ対戦形式で新しいゲームを開始する", () => {
    const game = useGameStore();
    const session = useGameSession();
    session.startGame("winding-cycle");
    game.placeRoad({ x: 3, y: 4 }, 1);

    session.restart();

    expect(game.state).toEqual(createWindingCycleInitialState());
  });
});
