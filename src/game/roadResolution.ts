import { setCell } from "./board";
import { findDemolitionTargets, removeRoads } from "./rules/demolition";
import type { Board, Coordinate, PlayerColor } from "./types";

export type RoadPlacement = Readonly<{
  coordinate: Coordinate;
  color: PlayerColor;
  level: number;
}>;

export type RoadPlacementResolution = Readonly<{
  boardBeforeDemolition: Board;
  board: Board;
  removedCells: readonly Coordinate[];
}>;

export function resolveRoadPlacement(
  board: Board,
  placement: RoadPlacement,
): RoadPlacementResolution {
  const boardBeforeDemolition = setCell(board, placement.coordinate, {
    kind: "road",
    color: placement.color,
    level: placement.level,
  });
  const removedCells = findDemolitionTargets(boardBeforeDemolition);

  return {
    boardBeforeDemolition,
    board: removeRoads(boardBeforeDemolition, removedCells),
    removedCells,
  };
}
