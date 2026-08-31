import type { GameMove, MoveValidation, TransitionResult } from "./moveTypes";
import type { GameState } from "./state";
import type { PlayerColor } from "./types";

export type GameEngine<State extends GameState> = Readonly<{
  id: State["mode"];
  createInitialState(): State;
  getLegalMoves(state: State): readonly GameMove[];
  validateMove(state: State, move: GameMove): MoveValidation;
  applyMove(state: State, move: GameMove): TransitionResult<State>;
  resign(state: State, player: PlayerColor): TransitionResult<State>;
}>;
