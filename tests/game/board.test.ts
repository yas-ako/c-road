import { describe, expect, it } from "vitest";

import {
  createEmptyBoard,
  displayTileToCoordinate,
  getCell,
  isDisplayEdge,
  moveCoordinate,
  normalizeAxis,
  normalizeCoordinate,
  setCell,
} from "../../src/game/board";
import { BOARD_SIZE, DISPLAY_BOARD_SIZE } from "../../src/game/types";

describe("createEmptyBoard", () => {
  it("13×13の空の盤面を生成する", () => {
    const board = createEmptyBoard();

    expect(board).toHaveLength(BOARD_SIZE);
    expect(board.every((row) => row.length === BOARD_SIZE)).toBe(true);
    expect(board.flat().every((cell) => cell.kind === "empty")).toBe(true);
  });
});

describe("トーラス座標", () => {
  it.each([
    { input: -14, expected: 12 },
    { input: -13, expected: 0 },
    { input: -1, expected: 12 },
    { input: 0, expected: 0 },
    { input: 12, expected: 12 },
    { input: 13, expected: 0 },
    { input: 27, expected: 1 },
  ])("軸座標 $input を $expected に正規化する", ({ input, expected }) => {
    expect(normalizeAxis(input)).toBe(expected);
  });

  it("座標の両軸を正規化する", () => {
    expect(normalizeCoordinate({ x: -1, y: 13 })).toEqual({ x: 12, y: 0 });
  });

  it("方向と距離を指定してトーラス上を移動する", () => {
    expect(moveCoordinate({ x: 12, y: 0 }, { x: 1, y: -1 })).toEqual({
      x: 0,
      y: 12,
    });
    expect(moveCoordinate({ x: 1, y: 1 }, { x: -1, y: 1 }, 3)).toEqual({
      x: 11,
      y: 4,
    });
  });
});

describe("盤面の読み書き", () => {
  it("範囲外の座標をトーラス座標として読み取る", () => {
    const board = setCell(
      createEmptyBoard(),
      { x: 12, y: 0 },
      {
        kind: "road",
        color: "blue",
        level: 2,
      },
    );

    expect(getCell(board, { x: -1, y: 13 })).toEqual({
      kind: "road",
      color: "blue",
      level: 2,
    });
  });

  it("元の盤面を変更せずに指定セルを更新する", () => {
    const board = createEmptyBoard();
    const nextBoard = setCell(
      board,
      { x: 2, y: 3 },
      {
        kind: "road",
        color: "red",
        level: 4,
      },
    );

    expect(nextBoard).not.toBe(board);
    expect(nextBoard[2]).not.toBe(board[2]);
    expect(nextBoard[1]).toBe(board[1]);
    expect(getCell(board, { x: 2, y: 3 })).toEqual({ kind: "empty" });
    expect(getCell(nextBoard, { x: 2, y: 3 })).toEqual({
      kind: "road",
      color: "red",
      level: 4,
    });
  });
});

describe("表示盤面", () => {
  it.each([
    { tile: 0, coordinate: { x: 12, y: 12 } },
    { tile: 14, coordinate: { x: 0, y: 12 } },
    { tile: 16, coordinate: { x: 0, y: 0 } },
    { tile: 224, coordinate: { x: 0, y: 0 } },
  ])("表示タイル $tile を論理座標へ変換する", ({ tile, coordinate }) => {
    expect(displayTileToCoordinate(tile)).toEqual(coordinate);
  });

  it("15×15表示の外周を判定する", () => {
    const tileCount = DISPLAY_BOARD_SIZE * DISPLAY_BOARD_SIZE;
    const edgeTiles = Array.from(
      { length: tileCount },
      (_, tile) => tile,
    ).filter(isDisplayEdge);

    expect(edgeTiles).toHaveLength(56);
    expect(isDisplayEdge(0)).toBe(true);
    expect(isDisplayEdge(16)).toBe(false);
    expect(isDisplayEdge(224)).toBe(true);
  });
});
