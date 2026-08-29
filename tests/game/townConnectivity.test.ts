import { describe, expect, it } from "vitest";

import { setCell } from "../../src/game/board";
import {
  findTownWin,
  getAdjacentRoadsToTown,
} from "../../src/game/rules/townConnectivity";
import { createTownSetupGameState } from "../../src/game/state";
import type { Board, Coordinate, PlayerColor } from "../../src/game/types";

function completeTowns(): Board {
  const initial = createTownSetupGameState();
  return setCell(
    setCell(
      initial.board,
      { x: 3, y: 2 },
      { kind: "town", townId: "north-west" },
    ),
    { x: 9, y: 10 },
    { kind: "town", townId: "south-east" },
  );
}

function addRoads(
  board: Board,
  color: PlayerColor,
  roads: readonly Readonly<{ coordinate: Coordinate; level?: number }>[],
): Board {
  return roads.reduce(
    (result, { coordinate, level = 1 }) =>
      setCell(result, coordinate, { kind: "road", color, level }),
    board,
  );
}

describe("getAdjacentRoadsToTown", () => {
  it("街の8方向に隣接する道路を道路番号にかかわらず返す", () => {
    let board = completeTowns();
    board = addRoads(board, "blue", [
      { coordinate: { x: 1, y: 1 }, level: 8 },
      { coordinate: { x: 2, y: 1 }, level: 3 },
    ]);

    expect(getAdjacentRoadsToTown(board, "north-west", "blue")).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);
  });

  it("街の2マス両方に隣接する同じ道路を重複して返さない", () => {
    const board = addRoads(completeTowns(), "blue", [
      { coordinate: { x: 3, y: 1 } },
    ]);

    expect(getAdjacentRoadsToTown(board, "north-west", "blue")).toEqual([
      { x: 3, y: 1 },
    ]);
  });

  it("色を指定した場合はその色の道路だけを返す", () => {
    let board = addRoads(completeTowns(), "blue", [
      { coordinate: { x: 1, y: 2 } },
    ]);
    board = addRoads(board, "red", [{ coordinate: { x: 2, y: 1 } }]);

    expect(getAdjacentRoadsToTown(board, "north-west", "red")).toEqual([
      { x: 2, y: 1 },
    ]);
  });
});

describe("findTownWin", () => {
  it("両方の街をつなぐ一本の道路経路を復元する", () => {
    const coordinates = Array.from({ length: 7 }, (_, index) => ({
      x: index + 3,
      y: index + 3,
    }));
    const board = addRoads(
      completeTowns(),
      "blue",
      coordinates.map((coordinate) => ({ coordinate })),
    );

    expect(findTownWin(board, "blue")).toEqual({
      winner: "blue",
      roadPath: coordinates,
      townConnections: [
        { townId: "north-west", roadCell: { x: 3, y: 3 } },
        { townId: "south-east", roadCell: { x: 9, y: 9 } },
      ],
    });
  });

  it("道路番号差が1を超える場所では接続しない", () => {
    let board = addRoads(completeTowns(), "blue", [
      { coordinate: { x: 3, y: 3 }, level: 1 },
      { coordinate: { x: 4, y: 4 }, level: 3 },
    ]);
    board = addRoads(
      board,
      "blue",
      Array.from({ length: 5 }, (_, index) => ({
        coordinate: { x: index + 5, y: index + 5 },
        level: 3,
      })),
    );

    expect(findTownWin(board, "blue")).toBeNull();
  });

  it("異なる色の道路を経路に使用しない", () => {
    let board = addRoads(completeTowns(), "blue", [
      { coordinate: { x: 3, y: 3 } },
      { coordinate: { x: 5, y: 5 } },
      { coordinate: { x: 6, y: 6 } },
      { coordinate: { x: 7, y: 7 } },
      { coordinate: { x: 8, y: 8 } },
      { coordinate: { x: 9, y: 9 } },
    ]);
    board = addRoads(board, "red", [{ coordinate: { x: 4, y: 4 } }]);

    expect(findTownWin(board, "blue")).toBeNull();
  });

  it("同じ街に隣接する道路同士を街経由で接続しない", () => {
    let board = addRoads(completeTowns(), "blue", [
      { coordinate: { x: 1, y: 1 } },
      { coordinate: { x: 4, y: 3 } },
    ]);
    board = addRoads(
      board,
      "blue",
      Array.from({ length: 6 }, (_, index) => ({
        coordinate: { x: index + 4, y: index + 3 },
      })),
    );

    expect(findTownWin(board, "blue")).toBeNull();
  });

  it("1つの道路が両方の街に隣接すれば1マスの経路として返す", () => {
    let board = completeTowns();
    board = setCell(board, { x: 9, y: 10 }, { kind: "empty" });
    board = setCell(board, { x: 3, y: 2 }, { kind: "empty" });
    board = setCell(
      board,
      { x: 3, y: 3 },
      { kind: "town", townId: "south-east" },
    );
    board = addRoads(board, "red", [{ coordinate: { x: 3, y: 2 } }]);

    expect(findTownWin(board, "red")?.roadPath).toEqual([{ x: 3, y: 2 }]);
  });
});
