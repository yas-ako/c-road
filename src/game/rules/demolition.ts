import { getCell, moveCoordinate } from "../board";
import {
  BOARD_SIZE,
  DIRECTIONS,
  type Board,
  type Coordinate,
  type Direction,
} from "../types";

function coordinateKey({ x, y }: Coordinate): string {
  return `${x},${y}`;
}

function collectChain(
  board: Board,
  start: Coordinate,
  direction: Direction,
  level: number,
): Coordinate[] {
  const chain: Coordinate[] = [];

  for (let distance = 1; distance <= BOARD_SIZE; distance++) {
    const coordinate = moveCoordinate(start, direction, distance);

    if (coordinate.x === start.x && coordinate.y === start.y) {
      return chain;
    }

    const cell = getCell(board, coordinate);
    if (cell.kind !== "road") return [];

    if (cell.level === level - 1) {
      chain.push(coordinate);
      continue;
    }

    return cell.level === level && chain.length > 0 ? chain : [];
  }

  return [];
}

export function findDemolitionTargets(board: Board): Coordinate[] {
  const targets = new Map<string, Coordinate>();

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const start = { x, y };
      const cell = getCell(board, start);

      if (cell.kind !== "road" || cell.level <= 1) continue;

      for (const direction of DIRECTIONS) {
        for (const coordinate of collectChain(
          board,
          start,
          direction,
          cell.level,
        )) {
          targets.set(coordinateKey(coordinate), coordinate);
        }
      }
    }
  }

  return [...targets.values()].sort((first, second) =>
    first.x === second.x ? first.y - second.y : first.x - second.x,
  );
}
