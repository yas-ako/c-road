import { createEmptyBoard, setCell } from "./board";
import {
  TOWN_ANCHORS,
  type Board,
  type Coordinate,
  type PlayerColor,
  type TownId,
} from "./types";

export type TownRoadConnection = Readonly<{
  townId: TownId;
  roadCell: Coordinate;
}>;

export type TownConnectionWin = Readonly<{
  type: "win";
  condition: "town-connection";
  winner: PlayerColor;
  roadPath: readonly Coordinate[];
  townConnections: readonly [TownRoadConnection, TownRoadConnection];
}>;

export type WindingCycleWin = Readonly<{
  type: "win";
  condition: "winding-cycle";
  winner: PlayerColor;
  roadCycle: readonly Coordinate[];
  winding: Coordinate;
}>;

export type ResignationResult = Readonly<{
  type: "win";
  condition: "resignation";
  winner: PlayerColor;
  resignedPlayer: PlayerColor;
}>;

export type DrawResult = Readonly<{
  type: "draw";
  reason: "no-legal-moves";
}>;

export type GameResult =
  | TownConnectionWin
  | WindingCycleWin
  | ResignationResult
  | DrawResult;

type SharedGameState = Readonly<{
  board: Board;
  currentPlayer: PlayerColor;
  turn: number;
}>;

export type TownConnectionPhase =
  | "placing-north-west-town"
  | "placing-south-east-town"
  | "placing-roads";

export type TownConnectionGameState = SharedGameState &
  Readonly<{
    mode: "town-connection";
    phase: TownConnectionPhase;
    result: TownConnectionWin | ResignationResult | DrawResult | null;
  }>;

export type WindingCycleGameState = SharedGameState &
  Readonly<{
    mode: "winding-cycle";
    phase: "placing-roads";
    result: WindingCycleWin | ResignationResult | DrawResult | null;
  }>;

export type GameState = TownConnectionGameState | WindingCycleGameState;

export function createTownConnectionInitialState(): TownConnectionGameState {
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
    mode: "town-connection",
    board,
    phase: "placing-north-west-town",
    currentPlayer: "blue",
    turn: 0,
    result: null,
  };
}

export function createWindingCycleInitialState(): WindingCycleGameState {
  return {
    mode: "winding-cycle",
    board: createEmptyBoard(),
    phase: "placing-roads",
    currentPlayer: "blue",
    turn: 0,
    result: null,
  };
}

export function otherPlayer(player: PlayerColor): PlayerColor {
  return player === "blue" ? "red" : "blue";
}
