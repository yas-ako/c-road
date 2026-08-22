import { createEmptyBoard } from "./board";
import type { Board, PlayerColor } from "./types";

export type GameState = Readonly<{
  board: Board;
  currentPlayer: PlayerColor;
  turn: number;
}>;

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: "blue",
    turn: 0,
  };
}

export function otherPlayer(player: PlayerColor): PlayerColor {
  return player === "blue" ? "red" : "blue";
}
