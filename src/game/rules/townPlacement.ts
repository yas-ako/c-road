import { getCell, isLogicalCoordinate } from "../board";
import { TOWN_ANCHORS, type Coordinate, type TownId } from "../types";
import type { GameState } from "../state";

const ORTHOGONAL_DIRECTIONS = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
] as const;

export function getTownExtensionCandidates(
  state: GameState,
  townId: TownId,
): readonly Coordinate[] {
  const anchor = TOWN_ANCHORS[townId];
  return ORTHOGONAL_DIRECTIONS.map(({ x, y }) => ({
    x: anchor.x + x,
    y: anchor.y + y,
  })).filter(
    (coordinate) =>
      isLogicalCoordinate(coordinate) &&
      getCell(state.board, coordinate).kind === "empty",
  );
}
