import type { GameEngine } from "../../engine";
import type {
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
import { findWindingCycle } from "../../rules/windingCycle";
import {
  createWindingCycleInitialState,
  type WindingCycleGameState,
} from "../../state";

function validateMove(
  state: WindingCycleGameState,
  move: GameMove,
): MoveValidation {
  if (move.type === "place-road") return validateRoadMove(state, move);

  const contextReason = getMoveContextInvalidReason(state, move.player);
  return {
    valid: false,
    reason: contextReason ?? "wrong-phase",
  };
}

function applyMove(
  state: WindingCycleGameState,
  move: GameMove,
): TransitionResult<WindingCycleGameState> {
  if (move.type === "place-road") {
    return applyRoadMove(state, move, findWindingCycle);
  }

  const validation = validateMove(state, move);
  if (validation.valid) {
    throw new Error("Winding-cycle game accepted a non-road move");
  }
  return { success: false, state, reason: validation.reason };
}

export const windingCycleGame: GameEngine<WindingCycleGameState> = {
  id: "winding-cycle",
  createInitialState: createWindingCycleInitialState,
  getLegalMoves: getLegalRoadMoves,
  validateMove,
  applyMove,
  resign: resignGame,
};
