import { describe, expect, it } from "vitest";

import { setCell } from "../../src/game/board";
import { findDemolitionTargets } from "../../src/game/rules/demolition";
import { getRoadPlacementRule } from "../../src/game/rules/placement";
import type { Board, Coordinate } from "../../src/game/types";

const BOARD_SIZE = 13;

function createLegacyBoard(): number[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<number>(BOARD_SIZE).fill(0),
  );
}

function toBoard(legacyBoard: number[][]): Board {
  let board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ kind: "empty" }) as const),
  );

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const value = legacyBoard[x]?.[y] ?? 0;
      if (value === 0) continue;

      board = setCell(
        board,
        { x, y },
        {
          kind: "road",
          color: value > 0 ? "blue" : "red",
          level: Math.abs(value),
        },
      );
    }
  }

  return board;
}

function coordinateKeys(coordinates: readonly Coordinate[]): string[] {
  return coordinates.map(({ x, y }) => `${x},${y}`).sort();
}

describe("getRoadPlacementRule", () => {
  it.each([
    {
      name: "隣接道路なし",
      coordinate: { x: 6, y: 6 },
      arrange: () => createLegacyBoard(),
      expected: { minLevel: 1, maxLevel: 1, limitedBySandwich: false },
    },
    {
      name: "色を無視した隣接最大値",
      coordinate: { x: 6, y: 6 },
      arrange: () => {
        const board = createLegacyBoard();
        board[5]![6] = -4;
        board[7]![7] = 2;
        return board;
      },
      expected: { minLevel: 1, maxLevel: 5, limitedBySandwich: false },
    },
    {
      name: "異なる色の同番号による挟み込み",
      coordinate: { x: 6, y: 6 },
      arrange: () => {
        const board = createLegacyBoard();
        board[5]![6] = 3;
        board[7]![6] = -3;
        return board;
      },
      expected: { minLevel: 1, maxLevel: 3, limitedBySandwich: true },
    },
    {
      name: "複数方向の挟み込み",
      coordinate: { x: 6, y: 6 },
      arrange: () => {
        const board = createLegacyBoard();
        board[5]![6] = 5;
        board[7]![6] = 5;
        board[6]![5] = 3;
        board[6]![7] = -3;
        return board;
      },
      expected: { minLevel: 1, maxLevel: 3, limitedBySandwich: true },
    },
    {
      name: "トーラス境界の挟み込み",
      coordinate: { x: 0, y: 0 },
      arrange: () => {
        const board = createLegacyBoard();
        board[12]![0] = 4;
        board[1]![0] = -4;
        return board;
      },
      expected: { minLevel: 1, maxLevel: 4, limitedBySandwich: true },
    },
  ])("上限を返す: $name", ({ arrange, coordinate, expected }) => {
    const legacyBoard = arrange();
    expect(getRoadPlacementRule(toBoard(legacyBoard), coordinate)).toEqual(
      expected,
    );
  });

  it("街と空きマスを上限計算から除外する", () => {
    let board = toBoard(createLegacyBoard());
    board = setCell(
      board,
      { x: 5, y: 6 },
      {
        kind: "town",
        townId: "north-west",
      },
    );

    expect(getRoadPlacementRule(board, { x: 6, y: 6 })).toEqual({
      minLevel: 1,
      maxLevel: 1,
      limitedBySandwich: false,
    });
  });
});

describe("findDemolitionTargets", () => {
  it.each([
    {
      name: "1マス",
      arrange: () => {
        const board = createLegacyBoard();
        board[2]![6] = 3;
        board[3]![6] = 2;
        board[4]![6] = 3;
        return board;
      },
      expected: [{ x: 3, y: 6 }],
    },
    {
      name: "複数マスと異なる色",
      arrange: () => {
        const board = createLegacyBoard();
        board[2]![6] = 4;
        board[3]![6] = 3;
        board[4]![6] = -3;
        board[5]![6] = 3;
        board[6]![6] = -4;
        return board;
      },
      expected: [
        { x: 3, y: 6 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
      ],
    },
    {
      name: "斜め方向",
      arrange: () => {
        const board = createLegacyBoard();
        board[2]![2] = 3;
        board[3]![3] = -2;
        board[4]![4] = -3;
        return board;
      },
      expected: [{ x: 3, y: 3 }],
    },
    {
      name: "トーラス境界越し",
      arrange: () => {
        const board = createLegacyBoard();
        board[12]![6] = 3;
        board[0]![6] = 2;
        board[1]![6] = 3;
        return board;
      },
      expected: [{ x: 0, y: 6 }],
    },
    {
      name: "起点へ戻る一周",
      arrange: () => {
        const board = createLegacyBoard();
        board[0]![6] = 3;
        for (let x = 1; x < BOARD_SIZE; x++) board[x]![6] = 2;
        return board;
      },
      expected: Array.from({ length: BOARD_SIZE - 1 }, (_, index) => ({
        x: index + 1,
        y: 6,
      })),
    },
  ])("対象を重複なく返す: $name", ({ arrange, expected }) => {
    const legacyBoard = arrange();
    const targets = findDemolitionTargets(toBoard(legacyBoard));

    expect(coordinateKeys(targets)).toEqual(coordinateKeys(expected));
    expect(new Set(coordinateKeys(targets)).size).toBe(targets.length);
  });

  it("街を探索と取り壊しの対象から除外する", () => {
    const legacyBoard = createLegacyBoard();
    legacyBoard[2]![6] = 3;
    legacyBoard[4]![6] = 3;
    let board = toBoard(legacyBoard);
    board = setCell(
      board,
      { x: 3, y: 6 },
      {
        kind: "town",
        townId: "north-west",
      },
    );

    expect(findDemolitionTargets(board)).toEqual([]);
  });
});
