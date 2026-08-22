import {
  BOARD_SIZE,
  DISPLAY_BOARD_SIZE,
  type Board,
  type Cell,
  type Coordinate,
  type Direction,
} from "./types";

const EMPTY_CELL: Cell = Object.freeze({ kind: "empty" });

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<Cell>(BOARD_SIZE).fill(EMPTY_CELL),
  );
}

export function normalizeAxis(value: number): number {
  return ((value % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
}

export function normalizeCoordinate(coordinate: Coordinate): Coordinate {
  return {
    x: normalizeAxis(coordinate.x),
    y: normalizeAxis(coordinate.y),
  };
}

export function moveCoordinate(
  coordinate: Coordinate,
  direction: Direction,
  distance = 1,
): Coordinate {
  return normalizeCoordinate({
    x: coordinate.x + direction.x * distance,
    y: coordinate.y + direction.y * distance,
  });
}

export function getCell(board: Board, coordinate: Coordinate): Cell {
  const normalized = normalizeCoordinate(coordinate);
  return board[normalized.x]?.[normalized.y] ?? EMPTY_CELL;
}

export function setCell(
  board: Board,
  coordinate: Coordinate,
  cell: Cell,
): Board {
  const normalized = normalizeCoordinate(coordinate);
  const row = board[normalized.x];

  if (row === undefined) return board;

  const nextRow = [...row];
  nextRow[normalized.y] = cell;

  const nextBoard = [...board];
  nextBoard[normalized.x] = nextRow;
  return nextBoard;
}

export function displayTileToCoordinate(tileIndex: number): Coordinate {
  const displayX = tileIndex % DISPLAY_BOARD_SIZE;
  const displayY = Math.floor(tileIndex / DISPLAY_BOARD_SIZE);

  return {
    x: normalizeAxis(displayX - 1),
    y: normalizeAxis(displayY - 1),
  };
}

export function isDisplayEdge(tileIndex: number): boolean {
  const displayX = tileIndex % DISPLAY_BOARD_SIZE;
  const displayY = Math.floor(tileIndex / DISPLAY_BOARD_SIZE);

  return (
    displayX === 0 ||
    displayX === DISPLAY_BOARD_SIZE - 1 ||
    displayY === 0 ||
    displayY === DISPLAY_BOARD_SIZE - 1
  );
}
