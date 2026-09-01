import { getCell, moveCoordinate } from "../board";
import type { WindingCycleWin } from "../state";
import {
  BOARD_SIZE,
  DIRECTIONS,
  type Board,
  type Coordinate,
  type Direction,
  type PlayerColor,
} from "../types";
import { areRoadsConnected } from "./connectivity";

type LiftedCoordinate = Readonly<{
  x: number;
  y: number;
}>;

function coordinateKey({ x, y }: Coordinate): string {
  return `${x},${y}`;
}

function addDirection(
  coordinate: LiftedCoordinate,
  direction: Direction,
): LiftedCoordinate {
  return {
    x: coordinate.x + direction.x,
    y: coordinate.y + direction.y,
  };
}

function liftedCoordinatesEqual(
  first: LiftedCoordinate,
  second: LiftedCoordinate,
): boolean {
  return first.x === second.x && first.y === second.y;
}

function pathToRoot(
  start: Coordinate,
  parents: ReadonlyMap<string, Coordinate | null>,
): Coordinate[] {
  const path: Coordinate[] = [];
  let current: Coordinate | null = start;

  while (current !== null) {
    path.push(current);
    current = parents.get(coordinateKey(current)) ?? null;
  }

  return path;
}

function reconstructCycle(
  current: Coordinate,
  next: Coordinate,
  parents: ReadonlyMap<string, Coordinate | null>,
): Coordinate[] {
  const currentPath = pathToRoot(current, parents);
  const nextPath = pathToRoot(next, parents);
  const nextIndices = new Map(
    nextPath.map((coordinate, index) => [coordinateKey(coordinate), index]),
  );
  const currentCommonIndex = currentPath.findIndex((coordinate) =>
    nextIndices.has(coordinateKey(coordinate)),
  );

  if (currentCommonIndex < 0) {
    throw new Error("Connected roads did not share an exploration root");
  }

  const common = currentPath[currentCommonIndex];
  if (common === undefined) {
    throw new Error("Common ancestor was not found");
  }
  const nextCommonIndex = nextIndices.get(coordinateKey(common));
  if (nextCommonIndex === undefined) {
    throw new Error("Common ancestor index was not found");
  }

  return [
    ...nextPath.slice(0, nextCommonIndex + 1),
    ...currentPath.slice(0, currentCommonIndex).reverse(),
    next,
  ];
}

function windingFromDisplacement(displacement: LiftedCoordinate): Coordinate {
  if (displacement.x % BOARD_SIZE !== 0 || displacement.y % BOARD_SIZE !== 0) {
    throw new Error(
      "Lifted coordinate difference was not a board-size multiple",
    );
  }

  return {
    x: displacement.x / BOARD_SIZE,
    y: displacement.y / BOARD_SIZE,
  };
}

function shouldReverse(winding: Coordinate): boolean {
  return winding.x < 0 || (winding.x === 0 && winding.y < 0);
}

function normalizeCycle(
  roadCycle: readonly Coordinate[],
  winding: Coordinate,
): Readonly<{ roadCycle: readonly Coordinate[]; winding: Coordinate }> {
  if (!shouldReverse(winding)) return { roadCycle, winding };

  return {
    roadCycle: [...roadCycle].reverse(),
    winding: {
      x: winding.x === 0 ? 0 : -winding.x,
      y: winding.y === 0 ? 0 : -winding.y,
    },
  };
}

export function findWindingCycle(
  board: Board,
  color: PlayerColor,
): WindingCycleWin | null {
  const liftedCoordinates = new Map<string, LiftedCoordinate>();
  const parents = new Map<string, Coordinate | null>();

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const root = { x, y };
      const rootKey = coordinateKey(root);
      const rootCell = getCell(board, root);
      if (
        rootCell.kind !== "road" ||
        rootCell.color !== color ||
        liftedCoordinates.has(rootKey)
      ) {
        continue;
      }

      liftedCoordinates.set(rootKey, { x: 0, y: 0 });
      parents.set(rootKey, null);
      const queue: Coordinate[] = [root];

      for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
        const current = queue[queueIndex];
        if (current === undefined) continue;

        const currentKey = coordinateKey(current);
        const currentLifted = liftedCoordinates.get(currentKey);
        if (currentLifted === undefined) continue;
        const currentCell = getCell(board, current);

        for (const direction of DIRECTIONS) {
          const next = moveCoordinate(current, direction);
          const nextCell = getCell(board, next);
          if (!areRoadsConnected(currentCell, nextCell)) continue;

          const nextKey = coordinateKey(next);
          const expected = addDirection(currentLifted, direction);
          const recorded = liftedCoordinates.get(nextKey);

          if (recorded === undefined) {
            liftedCoordinates.set(nextKey, expected);
            parents.set(nextKey, current);
            queue.push(next);
            continue;
          }

          if (liftedCoordinatesEqual(recorded, expected)) continue;

          const displacement = {
            x: expected.x - recorded.x,
            y: expected.y - recorded.y,
          };
          const normalized = normalizeCycle(
            reconstructCycle(current, next, parents),
            windingFromDisplacement(displacement),
          );

          return {
            type: "win",
            condition: "winding-cycle",
            winner: color,
            roadCycle: normalized.roadCycle,
            winding: normalized.winding,
          };
        }
      }
    }
  }

  return null;
}
