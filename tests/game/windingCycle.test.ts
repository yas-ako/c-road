import { describe, expect, it } from "vitest";

import {
  createEmptyBoard,
  getCell,
  moveCoordinate,
  setCell,
} from "../../src/game/board";
import { areRoadsConnected } from "../../src/game/rules/connectivity";
import { findWindingCycle } from "../../src/game/rules/windingCycle";
import {
  BOARD_SIZE,
  DIRECTIONS,
  type Board,
  type Coordinate,
  type PlayerColor,
} from "../../src/game/types";

type Road = Readonly<{
  coordinate: Coordinate;
  color?: PlayerColor;
  level?: number;
}>;

function boardWithRoads(roads: readonly Road[]): Board {
  return roads.reduce(
    (board, { coordinate, color = "blue", level = 1 }) =>
      setCell(board, coordinate, { kind: "road", color, level }),
    createEmptyBoard(),
  );
}

function horizontalRoads(y = 6): Road[] {
  return Array.from({ length: BOARD_SIZE }, (_, x) => ({
    coordinate: { x, y },
  }));
}

function verticalRoads(x = 6): Road[] {
  return Array.from({ length: BOARD_SIZE }, (_, y) => ({
    coordinate: { x, y },
  }));
}

function diagonalRoads(): Road[] {
  return Array.from({ length: BOARD_SIZE }, (_, value) => ({
    coordinate: { x: value, y: value },
  }));
}

function expectValidCycle(board: Board, roadCycle: readonly Coordinate[]) {
  expect(roadCycle.length).toBeGreaterThan(2);
  expect(roadCycle[0]).toEqual(roadCycle.at(-1));

  for (let index = 0; index < roadCycle.length - 1; index++) {
    const current = roadCycle[index];
    const next = roadCycle[index + 1];
    expect(current).toBeDefined();
    expect(next).toBeDefined();
    if (current === undefined || next === undefined) continue;

    expect(
      DIRECTIONS.some((direction) => {
        const moved = moveCoordinate(current, direction);
        return moved.x === next.x && moved.y === next.y;
      }),
    ).toBe(true);
    expect(
      areRoadsConnected(getCell(board, current), getCell(board, next)),
    ).toBe(true);
  }
}

describe("findWindingCycle", () => {
  it.each([
    {
      name: "空盤面",
      roads: [],
    },
    {
      name: "境界を越えるだけの一本道",
      roads: [
        { coordinate: { x: 12, y: 6 } },
        { coordinate: { x: 0, y: 6 } },
        { coordinate: { x: 1, y: 6 } },
      ],
    },
    {
      name: "盤面中央の小さな閉路",
      roads: [
        { coordinate: { x: 5, y: 5 } },
        { coordinate: { x: 6, y: 5 } },
        { coordinate: { x: 5, y: 6 } },
      ],
    },
    {
      name: "境界をまたぐ小さな閉路",
      roads: [
        { coordinate: { x: 12, y: 5 } },
        { coordinate: { x: 0, y: 5 } },
        { coordinate: { x: 12, y: 6 } },
        { coordinate: { x: 0, y: 6 } },
      ],
    },
  ])("勝利にしない: $name", ({ roads }) => {
    expect(findWindingCycle(boardWithRoads(roads), "blue")).toBeNull();
  });

  it.each([
    {
      name: "左右",
      roads: horizontalRoads(),
      winding: { x: 1, y: 0 },
    },
    {
      name: "上下",
      roads: verticalRoads(),
      winding: { x: 0, y: 1 },
    },
    {
      name: "斜め",
      roads: diagonalRoads(),
      winding: { x: 1, y: 1 },
    },
  ])("$name に一周する道を返す", ({ roads, winding }) => {
    const board = boardWithRoads(roads);
    const result = findWindingCycle(board, "blue");

    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.winner).toBe("blue");
    expect(result.winding).toEqual(winding);
    expectValidCycle(board, result.roadCycle);
  });

  it("道路番号差が2以上の場所では周回しない", () => {
    const roads = horizontalRoads().map((road) =>
      road.coordinate.x === 6 ? { ...road, level: 3 } : road,
    );

    expect(findWindingCycle(boardWithRoads(roads), "blue")).toBeNull();
  });

  it("異なる色の道を経路に含めない", () => {
    const roads = horizontalRoads().map((road) =>
      road.coordinate.x === 6 ? { ...road, color: "red" as const } : road,
    );

    expect(findWindingCycle(boardWithRoads(roads), "blue")).toBeNull();
  });

  it("分岐を含む道路網の一部に周回路があれば勝利にする", () => {
    const board = boardWithRoads([
      ...horizontalRoads(),
      { coordinate: { x: 6, y: 5 } },
      { coordinate: { x: 6, y: 4 } },
    ]);
    const result = findWindingCycle(board, "blue");

    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.winding).toEqual({ x: 1, y: 0 });
    expectValidCycle(board, result.roadCycle);
  });

  it("複数の連結成分のうち後から探索する成分に周回路があれば勝利にする", () => {
    const board = boardWithRoads([
      { coordinate: { x: 0, y: 0 } },
      { coordinate: { x: 1, y: 0 } },
      ...horizontalRoads(8),
    ]);
    const result = findWindingCycle(board, "blue");

    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.winding).toEqual({ x: 1, y: 0 });
    expectValidCycle(board, result.roadCycle);
  });
});
