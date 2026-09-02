import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCell, setCell } from "../../src/game/board";
import type { GameEvent } from "../../src/game/moveTypes";
import { useGameStore } from "../../src/stores/game";
import { useGamePresentationStore } from "../../src/stores/gamePresentation";
import { createTownRoadState } from "../helpers/gameState";

describe("game presentation store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("取り壊し前の盤面を表示し、時間経過後に確定盤面へ戻す", () => {
    const game = useGameStore();
    const presentation = useGamePresentationStore();
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
    expect(events).toBeDefined();

    presentation.present(events ?? []);

    expect(presentation.isBeingRemoved).toBe(true);
    expect(getCell(presentation.displayBoard, { x: 3, y: 6 })).toEqual({
      kind: "road",
      color: "red",
      level: 2,
    });

    vi.advanceTimersByTime(2000);

    expect(presentation.isBeingRemoved).toBe(false);
    expect(getCell(presentation.displayBoard, { x: 3, y: 6 })).toEqual({
      kind: "empty",
    });
  });

  it("リセットで待機中の演出を破棄する", () => {
    const presentation = useGamePresentationStore();
    const events = [
      {
        type: "demolition",
        boardBeforeDemolition: createTownRoadState().board,
        removedCells: [{ x: 3, y: 6 }],
      },
    ] satisfies readonly GameEvent[];

    presentation.present(events);
    vi.advanceTimersByTime(1000);

    presentation.reset();
    presentation.present(events);

    vi.advanceTimersByTime(1000);
    expect(presentation.isBeingRemoved).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(presentation.isBeingRemoved).toBe(false);
  });
});
