import { createEmptyBoard, setCell } from "./board";
import {
  TOWN_ANCHORS,
  type Board,
  type PlayerColor,
  type WinResult,
} from "./types";

export type GamePhase =
  | "placing-north-west-town"
  | "placing-south-east-town"
  | "placing-roads";

export type GameState = Readonly<{
  board: Board;
  phase: GamePhase;
  currentPlayer: PlayerColor;
  turn: number;
  winResult: WinResult | null;
}>;

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    phase: "placing-roads",
    currentPlayer: "blue",
    turn: 0,
    winResult: null,
  };
}

export function createTownSetupGameState(): GameState {
  let board = createEmptyBoard();
  board = setCell(board, TOWN_ANCHORS["north-west"], {
    kind: "town",
    townId: "north-west",
  });
  board = setCell(board, TOWN_ANCHORS["south-east"], {
    kind: "town",
    townId: "south-east",
  });

  return {
    board,
    phase: "placing-north-west-town",
    currentPlayer: "blue",
    turn: 0,
    winResult: null,
  };
}

export function otherPlayer(player: PlayerColor): PlayerColor {
  return player === "blue" ? "red" : "blue";
}
