import { describe, expect, it } from "vitest";

import {
  calcDemolition,
  calcUpperLimit,
  type Coordinate,
} from "../src/composables/useGameLogic";

const BOARD_SIZE = 13;

function createBoard(): number[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<number>(BOARD_SIZE).fill(0),
  );
}

function uniqueCoordinates(coordinates: Coordinate[]): string[] {
  return [...new Set(coordinates.map(({ x, y }) => `${x},${y}`))].sort();
}

describe("calcUpperLimit", () => {
  it("隣接する道がなければ道路番号を1に制限する", () => {
    expect(calcUpperLimit(createBoard(), 6, 6)).toEqual({
      maxNumber: 1,
      notificationType: -1,
    });
  });

  it("色を無視した隣接最大道路番号の1つ上まで許可する", () => {
    const board = createBoard();
    board[5]![6] = -4;
    board[7]![7] = 2;

    expect(calcUpperLimit(board, 6, 6)).toEqual({
      maxNumber: 5,
      notificationType: -1,
    });
  });

  it("同じ道路番号に一マスだけ挟まれた場合は例外上限を適用する", () => {
    const board = createBoard();
    board[5]![6] = 3;
    board[7]![6] = -3;

    expect(calcUpperLimit(board, 6, 6)).toEqual({
      maxNumber: 3,
      notificationType: 0,
    });
  });

  it("複数の道路番号に挟まれた場合は最小値を採用する", () => {
    const board = createBoard();
    board[5]![6] = 5;
    board[7]![6] = 5;
    board[6]![5] = 3;
    board[6]![7] = -3;

    expect(calcUpperLimit(board, 6, 6)).toEqual({
      maxNumber: 3,
      notificationType: 0,
    });
  });

  it("向かい合っていない同番号の道には例外を適用しない", () => {
    const board = createBoard();
    board[5]![5] = 2;
    board[6]![5] = 2;

    expect(calcUpperLimit(board, 6, 6)).toEqual({
      maxNumber: 3,
      notificationType: -1,
    });
  });

  it("トーラス境界の反対側を隣接マスとして扱う", () => {
    const board = createBoard();
    board[12]![0] = 4;
    board[1]![0] = -4;

    expect(calcUpperLimit(board, 0, 0)).toEqual({
      maxNumber: 4,
      notificationType: 0,
    });
  });
});

describe("calcDemolition", () => {
  it("n の道に挟まれた1マスの n-1 を取り壊す", () => {
    const board = createBoard();
    board[2]![6] = 3;
    board[3]![6] = 2;
    board[4]![6] = 3;

    expect(uniqueCoordinates(calcDemolition(board))).toEqual(["3,6"]);
  });

  it("連続する複数マスの n-1 をすべて取り壊す", () => {
    const board = createBoard();
    board[2]![6] = 4;
    board[3]![6] = 3;
    board[4]![6] = -3;
    board[5]![6] = 3;
    board[6]![6] = -4;

    expect(uniqueCoordinates(calcDemolition(board))).toEqual([
      "3,6",
      "4,6",
      "5,6",
    ]);
  });

  it("斜め方向と道の色を無視して判定する", () => {
    const board = createBoard();
    board[2]![2] = 3;
    board[3]![3] = -2;
    board[4]![4] = -3;

    expect(uniqueCoordinates(calcDemolition(board))).toEqual(["3,3"]);
  });

  it("トーラス境界を越えて挟まれた道を取り壊す", () => {
    const board = createBoard();
    board[12]![6] = 3;
    board[0]![6] = 2;
    board[1]![6] = 3;

    expect(uniqueCoordinates(calcDemolition(board))).toEqual(["0,6"]);
  });

  it("n-1 以外の道路番号が間にあれば取り壊さない", () => {
    const board = createBoard();
    board[2]![6] = 4;
    board[3]![6] = 3;
    board[4]![6] = 2;
    board[5]![6] = 4;

    expect(calcDemolition(board)).toEqual([]);
  });

  it("一周して起点へ戻るまで連続する n-1 を取り壊す", () => {
    const board = createBoard();
    board[0]![6] = 3;
    for (let x = 1; x < BOARD_SIZE; x++) {
      board[x]![6] = 2;
    }

    expect(uniqueCoordinates(calcDemolition(board))).toEqual(
      Array.from(
        { length: BOARD_SIZE - 1 },
        (_, index) => `${index + 1},6`,
      ).sort(),
    );
  });
});
