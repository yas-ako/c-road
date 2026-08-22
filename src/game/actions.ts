import { getCell, isLogicalCoordinate, setCell } from "./board";
import { findDemolitionTargets, removeRoads } from "./rules/demolition";
import { getRoadPlacementRule } from "./rules/placement";
import { otherPlayer, type GameState } from "./state";
import type { Board, Coordinate, PlayerColor } from "./types";

export type PlaceRoadAction = Readonly<{
  type: "place-road";
  player: PlayerColor;
  coordinate: Coordinate;
  level: number;
}>;

export type GameAction = PlaceRoadAction;

export type InvalidActionReason =
  | "wrong-player"
  | "invalid-coordinate"
  | "cell-is-not-empty"
  | "invalid-road-level"
  | "road-level-exceeds-limit";

export type ActionValidation =
  | Readonly<{ valid: true }>
  | Readonly<{ valid: false; reason: InvalidActionReason }>;

export type DemolitionEvent = Readonly<{
  type: "demolition";
  boardBeforeDemolition: Board;
  removedCells: readonly Coordinate[];
}>;

export type GameEvent = DemolitionEvent;

export type ApplyActionResult =
  | Readonly<{
      success: true;
      state: GameState;
      events: readonly GameEvent[];
    }>
  | Readonly<{
      success: false;
      state: GameState;
      reason: InvalidActionReason;
    }>;

export function validateAction(
  state: GameState,
  action: GameAction,
): ActionValidation {
  if (action.player !== state.currentPlayer) {
    return { valid: false, reason: "wrong-player" };
  }

  if (!isLogicalCoordinate(action.coordinate)) {
    return { valid: false, reason: "invalid-coordinate" };
  }

  if (getCell(state.board, action.coordinate).kind !== "empty") {
    return { valid: false, reason: "cell-is-not-empty" };
  }

  if (!Number.isInteger(action.level) || action.level < 1) {
    return { valid: false, reason: "invalid-road-level" };
  }

  const placementRule = getRoadPlacementRule(state.board, action.coordinate);
  if (action.level > placementRule.maxLevel) {
    return { valid: false, reason: "road-level-exceeds-limit" };
  }

  return { valid: true };
}

export function applyAction(
  state: GameState,
  action: GameAction,
): ApplyActionResult {
  const validation = validateAction(state, action);
  if (!validation.valid) {
    return {
      success: false,
      state,
      reason: validation.reason,
    };
  }

  const boardBeforeDemolition = setCell(state.board, action.coordinate, {
    kind: "road",
    color: action.player,
    level: action.level,
  });
  const removedCells = findDemolitionTargets(boardBeforeDemolition);
  const board = removeRoads(boardBeforeDemolition, removedCells);

  const events: GameEvent[] =
    removedCells.length === 0
      ? []
      : [
          {
            type: "demolition",
            boardBeforeDemolition,
            removedCells,
          },
        ];

  return {
    success: true,
    state: {
      board,
      currentPlayer: otherPlayer(state.currentPlayer),
      turn: state.turn + 1,
    },
    events,
  };
}
