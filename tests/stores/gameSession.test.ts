import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGameSession } from "../../src/composables/useGameSession";
import { createTownConnectionInitialState } from "../../src/game/state";
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

    interaction.selectCell(3, 2);
    notification.show(0);

    session.reset();

    expect(game.state).toEqual(createTownConnectionInitialState());
    expect(interaction.selectedCell).toEqual([-1, -1]);
    expect(interaction.maxCellNumber).toBe(10);
    expect(presentation.isBeingRemoved).toBe(false);
    expect(notification.isVisible).toBe(false);
    expect(notification.text).toEqual(["", ""]);
  });
});
