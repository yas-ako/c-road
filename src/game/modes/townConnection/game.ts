import { getCell, isLogicalCoordinate, setCell } from "../../board";
import type { GameEngine } from "../../engine";
import type {
  ExtendTownMove,
  GameMove,
  MoveValidation,
  TransitionResult,
} from "../../moveTypes";
import {
  applyRoadMove,
  getLegalRoadMoves,
  getMoveContextInvalidReason,
  resignGame,
  validateRoadMove,
} from "../../roadMoves";
import { findTownWin } from "../../rules/townConnectivity";
import {
  getActiveTownId,
  getTownExtensionCandidates,
} from "../../rules/townPlacement";
import {
  createTownConnectionInitialState,
  type TownConnectionGameState,
} from "../../state";
import { TOWN_ANCHORS } from "../../types";

function validateTownMove(
  state: TownConnectionGameState,
  move: ExtendTownMove,
): MoveValidation {
  const contextReason = getMoveContextInvalidReason(state, move.player);
  if (contextReason !== null) return { valid: false, reason: contextReason };

  const expectedTown = getActiveTownId(state);
  if (expectedTown === null) return { valid: false, reason: "wrong-phase" };
  if (move.townId !== expectedTown) {
    return { valid: false, reason: "wrong-town" };
  }
  if (!isLogicalCoordinate(move.coordinate)) {
    return { valid: false, reason: "invalid-coordinate" };
  }
  if (getCell(state.board, move.coordinate).kind !== "empty") {
    return { valid: false, reason: "cell-is-not-empty" };
  }

  const anchor = TOWN_ANCHORS[move.townId];
  const distance =
    Math.abs(anchor.x - move.coordinate.x) +
    Math.abs(anchor.y - move.coordinate.y);

  return distance === 1
    ? { valid: true }
    : { valid: false, reason: "town-cell-is-not-adjacent" };
}

function validateMove(
  state: TownConnectionGameState,
  move: GameMove,
): MoveValidation {
  return move.type === "place-road"
    ? validateRoadMove(state, move)
    : validateTownMove(state, move);
}

function getLegalMoves(state: TownConnectionGameState): readonly GameMove[] {
  if (state.result !== null) return [];
  if (state.phase === "placing-roads") return getLegalRoadMoves(state);

  const townId = getActiveTownId(state);
  if (townId === null) return [];

  return getTownExtensionCandidates(state, townId)
    .map<ExtendTownMove>((coordinate) => ({
      type: "extend-town",
      player: state.currentPlayer,
      townId,
      coordinate,
    }))
    .filter((move) => validateTownMove(state, move).valid);
}

function applyTownMove(
  state: TownConnectionGameState,
  move: ExtendTownMove,
): TransitionResult<TownConnectionGameState> {
  const validation = validateTownMove(state, move);
  if (!validation.valid) {
    return { success: false, state, reason: validation.reason };
  }

  return {
    success: true,
    state: {
      ...state,
      board: setCell(state.board, move.coordinate, {
        kind: "town",
        townId: move.townId,
      }),
      phase:
        move.townId === "north-west"
          ? "placing-south-east-town"
          : "placing-roads",
      currentPlayer: move.townId === "north-west" ? "red" : "blue",
    },
    events: [],
  };
}

function applyMove(
  state: TownConnectionGameState,
  move: GameMove,
): TransitionResult<TownConnectionGameState> {
  return move.type === "place-road"
    ? applyRoadMove(state, move, findTownWin)
    : applyTownMove(state, move);
}

export const townConnectionGame: GameEngine<TownConnectionGameState> = {
  id: "town-connection",
  createInitialState: createTownConnectionInitialState,
  getLegalMoves,
  validateMove,
  applyMove,
  resign: resignGame,
};
