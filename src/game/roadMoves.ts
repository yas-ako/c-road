import { getCell, isLogicalCoordinate } from "./board";
import type {
  GameEvent,
  InvalidMoveReason,
  MoveValidation,
  PlaceRoadMove,
  TransitionResult,
} from "./moveTypes";
import { resolveRoadPlacement } from "./roadResolution";
import { getRoadPlacementRule } from "./rules/placement";
import {
  otherPlayer,
  type DrawResult,
  type GameState,
  type ResignationResult,
} from "./state";
import {
  BOARD_SIZE,
  type Board,
  type Coordinate,
  type PlayerColor,
} from "./types";

type ModeVictory<State extends GameState> = Exclude<
  State["result"],
  DrawResult | ResignationResult | null
>;

type VictoryEvaluator<State extends GameState> = (
  board: Board,
  player: PlayerColor,
) => ModeVictory<State> | null;

function invalid(
  reason: InvalidMoveReason,
): Readonly<{ valid: false; reason: InvalidMoveReason }> {
  return { valid: false, reason };
}

export function getMoveContextInvalidReason(
  state: GameState,
  player: PlayerColor,
): InvalidMoveReason | null {
  if (state.result !== null) return "game-is-over";
  return player === state.currentPlayer ? null : "wrong-player";
}

export function validateRoadMove(
  state: GameState,
  move: PlaceRoadMove,
): MoveValidation {
  const contextReason = getMoveContextInvalidReason(state, move.player);
  if (contextReason !== null) return invalid(contextReason);
  if (state.phase !== "placing-roads") return invalid("wrong-phase");
  if (!isLogicalCoordinate(move.coordinate)) {
    return invalid("invalid-coordinate");
  }
  if (getCell(state.board, move.coordinate).kind !== "empty") {
    return invalid("cell-is-not-empty");
  }
  if (!Number.isInteger(move.level) || move.level < 1) {
    return invalid("invalid-road-level");
  }

  const placementRule = getRoadPlacementRule(state.board, move.coordinate);
  if (move.level > placementRule.maxLevel) {
    return invalid("road-level-exceeds-limit");
  }

  return { valid: true };
}

export function getLegalRoadMoves(state: GameState): readonly PlaceRoadMove[] {
  if (state.phase !== "placing-roads" || state.result !== null) return [];

  const moves: PlaceRoadMove[] = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const coordinate = { x, y };
      if (getCell(state.board, coordinate).kind !== "empty") continue;

      const { minLevel, maxLevel } = getRoadPlacementRule(
        state.board,
        coordinate,
      );
      for (let level = minLevel; level <= maxLevel; level++) {
        const move: PlaceRoadMove = {
          type: "place-road",
          player: state.currentPlayer,
          coordinate,
          level,
        };
        if (validateRoadMove(state, move).valid) moves.push(move);
      }
    }
  }

  return moves;
}

function hasEmptyCell(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell.kind === "empty"));
}

function demolitionEvents(
  boardBeforeDemolition: Board,
  removedCells: readonly Coordinate[],
): readonly GameEvent[] {
  return removedCells.length === 0
    ? []
    : [
        {
          type: "demolition",
          boardBeforeDemolition,
          removedCells,
        },
      ];
}

export function applyRoadMove<State extends GameState>(
  state: State,
  move: PlaceRoadMove,
  evaluateVictory: VictoryEvaluator<State>,
): TransitionResult<State> {
  const validation = validateRoadMove(state, move);
  if (!validation.valid) {
    return { success: false, state, reason: validation.reason };
  }

  const resolution = resolveRoadPlacement(state.board, {
    coordinate: move.coordinate,
    color: move.player,
    level: move.level,
  });
  const victory = evaluateVictory(resolution.board, move.player);
  const result =
    victory ??
    (hasEmptyCell(resolution.board)
      ? null
      : ({ type: "draw", reason: "no-legal-moves" } as const));

  const nextState = {
    ...state,
    board: resolution.board,
    currentPlayer:
      result === null ? otherPlayer(state.currentPlayer) : state.currentPlayer,
    turn: state.turn + 1,
    result,
  } as State;

  return {
    success: true,
    state: nextState,
    events: demolitionEvents(
      resolution.boardBeforeDemolition,
      resolution.removedCells,
    ),
  };
}

export function resignGame<State extends GameState>(
  state: State,
  player: PlayerColor,
): TransitionResult<State> {
  if (state.result !== null) {
    return { success: false, state, reason: "game-is-over" };
  }
  if (player !== state.currentPlayer) {
    return { success: false, state, reason: "wrong-player" };
  }

  const result: ResignationResult = {
    type: "win",
    condition: "resignation",
    winner: otherPlayer(player),
    resignedPlayer: player,
  };

  return {
    success: true,
    state: { ...state, result } as State,
    events: [],
  };
}
