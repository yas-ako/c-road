import type { GameEngine } from "../engine";
import type { GameEvent, InvalidMoveReason, PlaceRoadMove } from "../moveTypes";
import type { GameState } from "../state";
import type { Board, Cell, Coordinate } from "../types";

export type ImmediateRoadMoveAnalysis<State extends GameState> =
  | Readonly<{
      valid: false;
      move: PlaceRoadMove;
      reason: InvalidMoveReason;
    }>
  | Readonly<{
      valid: true;
      move: PlaceRoadMove;
      nextState: State;
      events: readonly GameEvent[];
      removedCells: readonly Coordinate[];
      placedRoadRemains: boolean;
      boardChanged: boolean;
    }>;

export type LegalRoadMoveAnalysis<State extends GameState> = Extract<
  ImmediateRoadMoveAnalysis<State>,
  { valid: true }
>;

function cellsEqual(first: Cell, second: Cell): boolean {
  if (first.kind !== second.kind) return false;
  if (first.kind === "empty" && second.kind === "empty") return true;
  if (first.kind === "town" && second.kind === "town") {
    return first.townId === second.townId;
  }
  if (first.kind === "road" && second.kind === "road") {
    return first.color === second.color && first.level === second.level;
  }
  return false;
}

function boardsEqual(first: Board, second: Board): boolean {
  if (first.length !== second.length) return false;

  return first.every((row, x) => {
    const otherRow = second[x];
    return (
      otherRow !== undefined &&
      row.length === otherRow.length &&
      row.every((cell, y) => {
        const otherCell = otherRow[y];
        return otherCell !== undefined && cellsEqual(cell, otherCell);
      })
    );
  });
}

function removedCells(events: readonly GameEvent[]): readonly Coordinate[] {
  return events.flatMap((event) =>
    event.type === "demolition" ? event.removedCells : [],
  );
}

export function analyzeRoadMove<State extends GameState>(
  engine: GameEngine<State>,
  state: State,
  move: PlaceRoadMove,
): ImmediateRoadMoveAnalysis<State> {
  const transition = engine.applyMove(state, move);
  if (!transition.success) {
    return {
      valid: false,
      move,
      reason: transition.reason,
    };
  }

  const nextCell =
    transition.state.board[move.coordinate.x]?.[move.coordinate.y];

  return {
    valid: true,
    move,
    nextState: transition.state,
    events: transition.events,
    removedCells: removedCells(transition.events),
    placedRoadRemains:
      nextCell?.kind === "road" &&
      nextCell.color === move.player &&
      nextCell.level === move.level,
    boardChanged: !boardsEqual(state.board, transition.state.board),
  };
}

export function analyzeLegalRoadMoves<State extends GameState>(
  engine: GameEngine<State>,
  state: State,
): readonly LegalRoadMoveAnalysis<State>[] {
  return engine
    .getLegalMoves(state)
    .filter((move): move is PlaceRoadMove => move.type === "place-road")
    .map((move) => {
      const analysis = analyzeRoadMove(engine, state, move);
      if (!analysis.valid) {
        throw new Error(`Generated move was invalid: ${analysis.reason}`);
      }
      return analysis;
    });
}
