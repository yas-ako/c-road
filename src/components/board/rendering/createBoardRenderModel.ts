import { getDisplayedTownConnections } from "~/components/board/townConnections";
import { getTownOverlays } from "~/components/board/townOverlay";
import { getCell } from "~/game/board";
import { areRoadsConnected } from "~/game/rules/connectivity";
import type { TownConnectionWin } from "~/game/state";
import {
  DISPLAY_BOARD_SIZE,
  type Board,
  type Coordinate,
  type Direction,
  type PlayerColor,
} from "~/game/types";
import { SVG_CELL_SIZE } from "./geometry";
import type {
  BoardRenderModel,
  DisplayCoordinate,
  RenderEmphasis,
  RenderPoint,
  RenderedCellMarker,
  RenderedConnection,
  RenderedRoad,
} from "./types";

const FORWARD_DIRECTIONS: readonly Direction[] = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
];

export type CreateBoardRenderModelOptions = Readonly<{
  board: Board;
  selectedCell?: Coordinate;
  townCandidates?: readonly Coordinate[];
  currentPlayer?: PlayerColor;
  winResult?: TownConnectionWin | null;
}>;

function coordinateKey({ x, y }: Coordinate): string {
  return `${x},${y}`;
}

function displayKey({ x, y }: DisplayCoordinate): string {
  return `${x},${y}`;
}

function coordinatesEqual(first: Coordinate, second: Coordinate): boolean {
  return first.x === second.x && first.y === second.y;
}

function normalizeDisplayAxis(value: number): number {
  const boardSize = DISPLAY_BOARD_SIZE - 2;
  return (((value - 1) % boardSize) + boardSize) % boardSize;
}

export function displayToLogicalCoordinate(
  displayCoordinate: DisplayCoordinate,
): Coordinate {
  return {
    x: normalizeDisplayAxis(displayCoordinate.x),
    y: normalizeDisplayAxis(displayCoordinate.y),
  };
}

function centerOf({ x, y }: DisplayCoordinate): RenderPoint {
  return {
    x: (x + 0.5) * SVG_CELL_SIZE,
    y: (y + 0.5) * SVG_CELL_SIZE,
  };
}

function logicalEdgeKey(first: Coordinate, second: Coordinate): string {
  const keys = [coordinateKey(first), coordinateKey(second)].sort();
  return `${keys[0]}|${keys[1]}`;
}

function getWinningEdgeKeys(
  winResult: TownConnectionWin | null,
): ReadonlySet<string> {
  const result = new Set<string>();
  if (winResult === null) return result;

  for (let index = 0; index < winResult.roadPath.length - 1; index++) {
    const first = winResult.roadPath[index];
    const second = winResult.roadPath[index + 1];
    if (first !== undefined && second !== undefined) {
      result.add(logicalEdgeKey(first, second));
    }
  }

  return result;
}

function emphasis(isWinning: boolean, hasWinner: boolean): RenderEmphasis {
  if (isWinning) return "winning";
  return hasWinner ? "muted" : "normal";
}

function createRoads(
  board: Board,
  winResult: TownConnectionWin | null,
): RenderedRoad[] {
  const winningRoadKeys = new Set(winResult?.roadPath.map(coordinateKey) ?? []);
  const roads: RenderedRoad[] = [];

  for (let y = 0; y < DISPLAY_BOARD_SIZE; y++) {
    for (let x = 0; x < DISPLAY_BOARD_SIZE; x++) {
      const displayCoordinate = { x, y };
      const logicalCoordinate = displayToLogicalCoordinate(displayCoordinate);
      const cell = getCell(board, logicalCoordinate);
      if (cell.kind !== "road") continue;

      roads.push({
        key: displayKey(displayCoordinate),
        displayCoordinate,
        logicalCoordinate,
        color: cell.color,
        level: cell.level,
        emphasis: emphasis(
          winningRoadKeys.has(coordinateKey(logicalCoordinate)),
          winResult !== null,
        ),
      });
    }
  }

  return roads;
}

function createRoadConnections(
  board: Board,
  winResult: TownConnectionWin | null,
): RenderedConnection[] {
  const winningEdges = getWinningEdgeKeys(winResult);
  const connections: RenderedConnection[] = [];

  for (let y = 0; y < DISPLAY_BOARD_SIZE; y++) {
    for (let x = 0; x < DISPLAY_BOARD_SIZE; x++) {
      const fromDisplay = { x, y };
      const fromLogical = displayToLogicalCoordinate(fromDisplay);
      const fromCell = getCell(board, fromLogical);
      if (fromCell.kind !== "road") continue;

      for (const direction of FORWARD_DIRECTIONS) {
        const toDisplay = {
          x: x + direction.x,
          y: y + direction.y,
        };
        if (
          toDisplay.x < 0 ||
          toDisplay.x >= DISPLAY_BOARD_SIZE ||
          toDisplay.y < 0 ||
          toDisplay.y >= DISPLAY_BOARD_SIZE
        ) {
          continue;
        }

        const toLogical = displayToLogicalCoordinate(toDisplay);
        if (!areRoadsConnected(fromCell, getCell(board, toLogical))) continue;

        connections.push({
          key: `${displayKey(fromDisplay)}|${displayKey(toDisplay)}`,
          kind: "road-road",
          from: centerOf(fromDisplay),
          to: centerOf(toDisplay),
          color: fromCell.color,
          emphasis: emphasis(
            winningEdges.has(logicalEdgeKey(fromLogical, toLogical)),
            winResult !== null,
          ),
        });
      }
    }
  }

  return connections;
}

function createTownConnections(
  board: Board,
  winResult: TownConnectionWin | null,
): RenderedConnection[] {
  return getDisplayedTownConnections(board).map((connection) => {
    const fromDisplay = {
      x: connection.roadCell.x + 1,
      y: connection.roadCell.y + 1,
    };
    const toDisplay = {
      x: connection.townCell.x + 1,
      y: connection.townCell.y + 1,
    };
    const isWinning =
      winResult?.townConnections.some(
        (winning) =>
          winning.townId === connection.townId &&
          coordinatesEqual(winning.roadCell, connection.roadCell),
      ) ?? false;

    return {
      key: `${connection.townId}|${coordinateKey(connection.roadCell)}`,
      kind: "town-road" as const,
      from: centerOf(fromDisplay),
      to: centerOf(toDisplay),
      color: connection.color,
      emphasis: emphasis(isWinning, winResult !== null),
    };
  });
}

function createMarkers(
  board: Board,
  selectedCell: Coordinate | undefined,
  townCandidates: readonly Coordinate[],
  currentPlayer: PlayerColor | undefined,
): RenderedCellMarker[] {
  const markers: RenderedCellMarker[] = [];

  for (let y = 0; y < DISPLAY_BOARD_SIZE; y++) {
    for (let x = 0; x < DISPLAY_BOARD_SIZE; x++) {
      const displayCoordinate = { x, y };
      const logicalCoordinate = displayToLogicalCoordinate(displayCoordinate);
      const key = displayKey(displayCoordinate);

      if (
        selectedCell !== undefined &&
        currentPlayer !== undefined &&
        getCell(board, selectedCell).kind === "empty" &&
        coordinatesEqual(logicalCoordinate, selectedCell)
      ) {
        markers.push({
          key: `selection-${key}`,
          displayCoordinate,
          kind: "selection",
          color: currentPlayer,
        });
      }

      if (
        townCandidates.some((candidate) =>
          coordinatesEqual(candidate, logicalCoordinate),
        )
      ) {
        markers.push({
          key: `town-candidate-${key}`,
          displayCoordinate,
          kind: "town-candidate",
        });
      }

      if (
        x === 0 ||
        y === 0 ||
        x === DISPLAY_BOARD_SIZE - 1 ||
        y === DISPLAY_BOARD_SIZE - 1
      ) {
        markers.push({
          key: `display-edge-${key}`,
          displayCoordinate,
          kind: "display-edge",
        });
      }
    }
  }

  return markers;
}

export function createBoardRenderModel(
  options: CreateBoardRenderModelOptions,
): BoardRenderModel {
  const winResult = options.winResult ?? null;
  return {
    roads: createRoads(options.board, winResult),
    connections: [
      ...createRoadConnections(options.board, winResult),
      ...createTownConnections(options.board, winResult),
    ],
    towns: getTownOverlays(options.board).map((town) => ({
      townId: town.townId,
      x: (town.column - 1) * SVG_CELL_SIZE,
      y: (town.row - 1) * SVG_CELL_SIZE,
      width: town.columnSpan * SVG_CELL_SIZE,
      height: town.rowSpan * SVG_CELL_SIZE,
    })),
    markers: createMarkers(
      options.board,
      options.selectedCell,
      options.townCandidates ?? [],
      options.currentPlayer,
    ),
  };
}
