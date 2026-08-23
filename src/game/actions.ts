import { getCell, isLogicalCoordinate, setCell } from "./board";
import { findDemolitionTargets, removeRoads } from "./rules/demolition";
import { getRoadPlacementRule } from "./rules/placement";
import { otherPlayer, type GameState } from "./state";
import {
  TOWN_ANCHORS,
  type Board,
  type Coordinate,
  type PlayerColor,
  type TownId,
} from "./types";

export type PlaceRoadAction = Readonly<{
  type: "place-road";
  player: PlayerColor;
  coordinate: Coordinate;
  level: number;
}>;

export type ExtendTownAction = Readonly<{
  type: "extend-town";
  player: PlayerColor;
  townId: TownId;
  coordinate: Coordinate;
}>;

export type GameAction = PlaceRoadAction | ExtendTownAction;

export type InvalidActionReason =
  | "wrong-player"
  | "wrong-phase"
  | "wrong-town"
  | "invalid-coordinate"
  | "cell-is-not-empty"
  | "town-cell-is-not-adjacent"
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

  if (action.type === "place-road" && state.phase !== "placing-roads") {
    return { valid: false, reason: "wrong-phase" };
  }

  if (action.type === "extend-town") {
    const expectedTown =
      state.phase === "placing-north-west-town"
        ? "north-west"
        : state.phase === "placing-south-east-town"
          ? "south-east"
          : undefined;
    if (expectedTown === undefined) {
      return { valid: false, reason: "wrong-phase" };
    }
    if (action.townId !== expectedTown) {
      return { valid: false, reason: "wrong-town" };
    }
  }

  if (!isLogicalCoordinate(action.coordinate)) {
    return { valid: false, reason: "invalid-coordinate" };
  }

  if (getCell(state.board, action.coordinate).kind !== "empty") {
    return { valid: false, reason: "cell-is-not-empty" };
  }

  if (action.type === "extend-town") {
    const anchor = TOWN_ANCHORS[action.townId];
    const distance =
      Math.abs(anchor.x - action.coordinate.x) +
      Math.abs(anchor.y - action.coordinate.y);
    return distance === 1
      ? { valid: true }
      : { valid: false, reason: "town-cell-is-not-adjacent" };
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

  if (action.type === "extend-town") {
    return {
      success: true,
      state: {
        board: setCell(state.board, action.coordinate, {
          kind: "town",
          townId: action.townId,
        }),
        phase:
          action.townId === "north-west"
            ? "placing-south-east-town"
            : "placing-roads",
        currentPlayer: action.townId === "north-west" ? "red" : "blue",
        turn: state.turn,
      },
      events: [],
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
      phase: state.phase,
      currentPlayer: otherPlayer(state.currentPlayer),
      turn: state.turn + 1,
    },
    events,
  };
}
