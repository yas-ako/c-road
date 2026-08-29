import { getCell, moveCoordinate } from "../board";
import type { Board, Coordinate, Direction } from "../types";

const FACING_DIRECTION_PAIRS: readonly (readonly [Direction, Direction])[] = [
  [
    { x: -1, y: -1 },
    { x: 1, y: 1 },
  ],
  [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
  ],
  [
    { x: 1, y: -1 },
    { x: -1, y: 1 },
  ],
  [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ],
];

export type RoadPlacementRule = Readonly<{
  minLevel: 1;
  maxLevel: number;
  limitedBySandwich: boolean;
}>;

function getRoadLevel(
  board: Board,
  coordinate: Coordinate,
  direction: Direction,
): number | null {
  const cell = getCell(board, moveCoordinate(coordinate, direction));
  return cell.kind === "road" ? cell.level : null;
}

export function getRoadPlacementRule(
  board: Board,
  coordinate: Coordinate,
): RoadPlacementRule {
  const adjacentLevels = FACING_DIRECTION_PAIRS.flatMap(([first, second]) => [
    getRoadLevel(board, coordinate, first),
    getRoadLevel(board, coordinate, second),
  ]).filter((level): level is number => level !== null);

  const normalLimit =
    adjacentLevels.length === 0 ? 1 : Math.max(...adjacentLevels) + 1;

  const sandwichLevels = FACING_DIRECTION_PAIRS.flatMap(([first, second]) => {
    const firstLevel = getRoadLevel(board, coordinate, first);
    const secondLevel = getRoadLevel(board, coordinate, second);

    return firstLevel !== null && firstLevel === secondLevel
      ? [firstLevel]
      : [];
  });

  if (sandwichLevels.length === 0) {
    return {
      minLevel: 1,
      maxLevel: normalLimit,
      limitedBySandwich: false,
    };
  }

  return {
    minLevel: 1,
    maxLevel: Math.min(normalLimit, ...sandwichLevels),
    limitedBySandwich: true,
  };
}
