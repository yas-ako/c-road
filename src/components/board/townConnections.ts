import { getCell, moveCoordinate } from "~/game/board";
import {
  getAdjacentRoadsToTown,
  getTownCells,
} from "~/game/rules/townConnectivity";
import {
  DIRECTIONS,
  type Board,
  type Coordinate,
  type PlayerColor,
  type TownId,
} from "~/game/types";

export type DisplayedTownConnection = Readonly<{
  townId: TownId;
  townCell: Coordinate;
  roadCell: Coordinate;
  color: PlayerColor;
}>;

const TOWN_IDS: readonly TownId[] = ["north-west", "south-east"];

function coordinatesEqual(first: Coordinate, second: Coordinate): boolean {
  return first.x === second.x && first.y === second.y;
}

export function chooseDisplayedTownCell(
  board: Board,
  townId: TownId,
  roadCell: Coordinate,
): Coordinate | undefined {
  const candidates = getTownCells(board, townId).flatMap((townCell) =>
    DIRECTIONS.flatMap((direction) =>
      coordinatesEqual(moveCoordinate(townCell, direction), roadCell)
        ? [{ townCell, isOrthogonal: direction.x === 0 || direction.y === 0 }]
        : [],
    ),
  );

  return (candidates.find(({ isOrthogonal }) => isOrthogonal) ?? candidates[0])
    ?.townCell;
}

export function getDisplayedTownConnections(
  board: Board,
): readonly DisplayedTownConnection[] {
  return TOWN_IDS.flatMap((townId) =>
    getAdjacentRoadsToTown(board, townId).flatMap((roadCell) => {
      const road = getCell(board, roadCell);
      const townCell = chooseDisplayedTownCell(board, townId, roadCell);
      if (road.kind !== "road" || townCell === undefined) return [];
      return [{ townId, townCell, roadCell, color: road.color }];
    }),
  );
}
