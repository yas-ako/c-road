import type { GameState } from "./state";
import type { Board, Coordinate, PlayerColor, TownId } from "./types";

export type PlaceRoadMove = Readonly<{
  type: "place-road";
  player: PlayerColor;
  coordinate: Coordinate;
  level: number;
}>;

export type ExtendTownMove = Readonly<{
  type: "extend-town";
  player: PlayerColor;
  townId: TownId;
  coordinate: Coordinate;
}>;

export type GameMove = PlaceRoadMove | ExtendTownMove;

export type InvalidMoveReason =
  | "game-is-over"
  | "wrong-player"
  | "wrong-phase"
  | "wrong-town"
  | "invalid-coordinate"
  | "cell-is-not-empty"
  | "town-cell-is-not-adjacent"
  | "invalid-road-level"
  | "road-level-exceeds-limit";

export type MoveValidation =
  | Readonly<{ valid: true }>
  | Readonly<{ valid: false; reason: InvalidMoveReason }>;

export type DemolitionEvent = Readonly<{
  type: "demolition";
  boardBeforeDemolition: Board;
  removedCells: readonly Coordinate[];
}>;

export type GameEvent = DemolitionEvent;

export type TransitionResult<State extends GameState> =
  | Readonly<{
      success: true;
      state: State;
      events: readonly GameEvent[];
    }>
  | Readonly<{
      success: false;
      state: State;
      reason: InvalidMoveReason;
    }>;
