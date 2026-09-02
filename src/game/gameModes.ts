import { townConnectionGame } from "./modes/townConnection/game";
import { windingCycleGame } from "./modes/windingCycle/game";
import type { GameMove, TransitionResult } from "./moveTypes";
import type { GameState } from "./state";
import type { PlayerColor } from "./types";

export type GameMode = GameState["mode"];

export const DEFAULT_GAME_MODE: GameMode = "town-connection";

function assertNever(value: never): never {
  throw new Error(`Unsupported game mode: ${String(value)}`);
}

export function createGameState(mode: GameMode): GameState {
  switch (mode) {
    case "town-connection":
      return townConnectionGame.createInitialState();
    case "winding-cycle":
      return windingCycleGame.createInitialState();
    default:
      return assertNever(mode);
  }
}

export function applyGameMove(
  state: GameState,
  move: GameMove,
): TransitionResult<GameState> {
  switch (state.mode) {
    case "town-connection":
      return townConnectionGame.applyMove(state, move);
    case "winding-cycle":
      return windingCycleGame.applyMove(state, move);
    default:
      return assertNever(state);
  }
}

export function applyResignation(
  state: GameState,
  player: PlayerColor,
): TransitionResult<GameState> {
  switch (state.mode) {
    case "town-connection":
      return townConnectionGame.resign(state, player);
    case "winding-cycle":
      return windingCycleGame.resign(state, player);
    default:
      return assertNever(state);
  }
}
