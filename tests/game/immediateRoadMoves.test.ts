import { describe, expect, it } from "vitest";

import {
  analyzeLegalRoadMoves,
  analyzeRoadMove,
} from "../../src/game/analysis/immediateRoadMoves";
import { setCell } from "../../src/game/board";
import { windingCycleGame } from "../../src/game/modes/windingCycle/game";
import {
  createWindingCycleInitialState,
  type WindingCycleGameState,
} from "../../src/game/state";
import type { Coordinate } from "../../src/game/types";

function stateWithRoads(
  roads: readonly Readonly<{
    coordinate: Coordinate;
    level: number;
  }>[],
): WindingCycleGameState {
  const initial = createWindingCycleInitialState();
  const board = roads.reduce(
    (nextBoard, { coordinate, level }) =>
      setCell(nextBoard, coordinate, {
        kind: "road",
        color: "blue",
        level,
      }),
    initial.board,
  );
  return { ...initial, board };
}

describe("immediate road move analysis", () => {
  it("2と3で二重に挟まれたマスでは1と2のどちらも残らない", () => {
    const state = stateWithRoads([
      { coordinate: { x: 5, y: 6 }, level: 2 },
      { coordinate: { x: 7, y: 6 }, level: 2 },
      { coordinate: { x: 6, y: 5 }, level: 3 },
      { coordinate: { x: 6, y: 7 }, level: 3 },
    ]);

    const analyses = analyzeLegalRoadMoves(windingCycleGame, state).filter(
      ({ move }) => move.coordinate.x === 6 && move.coordinate.y === 6,
    );

    expect(
      analyses.map((analysis) => ({
        level: analysis.move.level,
        valid: analysis.valid,
        placedRoadRemains: analysis.placedRoadRemains,
        boardChanged: analysis.boardChanged,
      })),
    ).toEqual([
      {
        level: 1,
        valid: true,
        placedRoadRemains: false,
        boardChanged: false,
      },
      {
        level: 2,
        valid: true,
        placedRoadRemains: false,
        boardChanged: false,
      },
    ]);
  });

  it("置いた道が取り壊されても、同時に既存の道を取り壊せる", () => {
    const state = stateWithRoads([
      { coordinate: { x: 6, y: 5 }, level: 3 },
      { coordinate: { x: 6, y: 7 }, level: 3 },
      { coordinate: { x: 7, y: 6 }, level: 1 },
      { coordinate: { x: 8, y: 6 }, level: 2 },
    ]);

    const analysis = analyzeRoadMove(windingCycleGame, state, {
      type: "place-road",
      player: "blue",
      coordinate: { x: 6, y: 6 },
      level: 2,
    });

    expect(analysis.valid).toBe(true);
    if (!analysis.valid) return;

    expect(analysis.placedRoadRemains).toBe(false);
    expect(analysis.boardChanged).toBe(true);
    expect(analysis.removedCells).toEqual([
      { x: 6, y: 6 },
      { x: 7, y: 6 },
    ]);
  });

  it("不正な手は既存の不正理由をそのまま返す", () => {
    const state = createWindingCycleInitialState();

    expect(
      analyzeRoadMove(windingCycleGame, state, {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 2,
      }),
    ).toEqual({
      valid: false,
      move: {
        type: "place-road",
        player: "blue",
        coordinate: { x: 6, y: 6 },
        level: 2,
      },
      reason: "road-level-exceeds-limit",
    });
  });
});
