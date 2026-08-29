import { getCell, moveCoordinate } from "../board";
import {
  BOARD_SIZE,
  DIRECTIONS,
  type Board,
  type Coordinate,
  type PlayerColor,
  type TownId,
  type TownRoadConnection,
  type WinResult,
} from "../types";
import { areRoadsConnected } from "./connectivity";

function coordinateKey({ x, y }: Coordinate): string {
  return `${x},${y}`;
}

export function getTownCells(
  board: Board,
  townId: TownId,
): readonly Coordinate[] {
  const result: Coordinate[] = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const cell = board[x]?.[y];
      if (cell?.kind === "town" && cell.townId === townId) {
        result.push({ x, y });
      }
    }
  }

  return result;
}

export function getAdjacentRoadsToTown(
  board: Board,
  townId: TownId,
  color?: PlayerColor,
): readonly Coordinate[] {
  const roads = new Map<string, Coordinate>();

  for (const townCell of getTownCells(board, townId)) {
    for (const direction of DIRECTIONS) {
      const coordinate = moveCoordinate(townCell, direction);
      const cell = getCell(board, coordinate);
      if (
        cell.kind === "road" &&
        (color === undefined || cell.color === color)
      ) {
        roads.set(coordinateKey(coordinate), coordinate);
      }
    }
  }

  return [...roads.values()];
}

export function findTownWin(
  board: Board,
  color: PlayerColor,
): WinResult | null {
  const startRoads = getAdjacentRoadsToTown(board, "north-west", color);
  const goalKeys = new Set(
    getAdjacentRoadsToTown(board, "south-east", color).map(coordinateKey),
  );
  const parents = new Map<string, Coordinate | null>();
  const coordinates = new Map<string, Coordinate>();
  const queue: Coordinate[] = [];

  for (const coordinate of startRoads) {
    const key = coordinateKey(coordinate);
    parents.set(key, null);
    coordinates.set(key, coordinate);
    queue.push(coordinate);
  }

  let goal: Coordinate | undefined;
  for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
    const current = queue[queueIndex];
    if (current === undefined) continue;

    if (goalKeys.has(coordinateKey(current))) {
      goal = current;
      break;
    }

    const currentCell = getCell(board, current);
    for (const direction of DIRECTIONS) {
      const next = moveCoordinate(current, direction);
      const nextKey = coordinateKey(next);
      if (parents.has(nextKey)) continue;
      if (!areRoadsConnected(currentCell, getCell(board, next))) continue;

      parents.set(nextKey, current);
      coordinates.set(nextKey, next);
      queue.push(next);
    }
  }

  if (goal === undefined) return null;

  const roadPath: Coordinate[] = [];
  let current: Coordinate | null = goal;
  while (current !== null) {
    roadPath.push(current);
    current = parents.get(coordinateKey(current)) ?? null;
  }
  roadPath.reverse();

  const firstRoad = roadPath[0];
  const lastRoad = roadPath.at(-1);
  if (firstRoad === undefined || lastRoad === undefined) return null;

  const townConnections: [TownRoadConnection, TownRoadConnection] = [
    { townId: "north-west", roadCell: firstRoad },
    { townId: "south-east", roadCell: lastRoad },
  ];

  return { winner: color, roadPath, townConnections };
}
