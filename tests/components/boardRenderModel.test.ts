import { describe, expect, it } from "vitest";

import {
  createBoardRenderModel,
  displayToLogicalCoordinate,
} from "../../src/components/board/rendering/createBoardRenderModel";
import { createEmptyBoard, setCell } from "../../src/game/board";
import type { Board, WinResult } from "../../src/game/types";

function addRoad(
  board: Board,
  x: number,
  y: number,
  color: "blue" | "red" = "blue",
  level = 1,
): Board {
  return setCell(board, { x, y }, { kind: "road", color, level });
}

describe("board render model", () => {
  it("15×15の外周を13×13の反対側へ対応させる", () => {
    expect(displayToLogicalCoordinate({ x: 0, y: 0 })).toEqual({
      x: 12,
      y: 12,
    });
    expect(displayToLogicalCoordinate({ x: 1, y: 1 })).toEqual({ x: 0, y: 0 });
    expect(displayToLogicalCoordinate({ x: 14, y: 14 })).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("論理盤面の端にある道路を外周へ複製する", () => {
    const model = createBoardRenderModel({
      board: addRoad(createEmptyBoard(), 0, 0),
    });

    expect(
      model.roads.map(({ displayCoordinate }) => displayCoordinate),
    ).toEqual([
      { x: 1, y: 1 },
      { x: 14, y: 1 },
      { x: 1, y: 14 },
      { x: 14, y: 14 },
    ]);
  });

  it("道路間の接続を表示位置ごとに一度だけ生成する", () => {
    let board = addRoad(createEmptyBoard(), 4, 4);
    board = addRoad(board, 5, 4);
    const model = createBoardRenderModel({ board });

    expect(model.connections).toEqual([
      {
        key: "5,5|6,5",
        kind: "road-road",
        from: { x: 550, y: 550 },
        to: { x: 650, y: 550 },
        color: "blue",
        emphasis: "normal",
      },
    ]);
  });

  it("トーラス境界の接続を両側の表示へ生成する", () => {
    let board = addRoad(createEmptyBoard(), 12, 5);
    board = addRoad(board, 0, 5);
    const connections = createBoardRenderModel({ board }).connections;

    expect(connections).toHaveLength(2);
    expect(connections.map(({ from, to }) => [from, to])).toEqual([
      [
        { x: 50, y: 650 },
        { x: 150, y: 650 },
      ],
      [
        { x: 1350, y: 650 },
        { x: 1450, y: 650 },
      ],
    ]);
  });

  it("街を1つの長方形にし、同じ道路との接続を1本だけ生成する", () => {
    let board = createEmptyBoard();
    board = setCell(
      board,
      { x: 2, y: 2 },
      {
        kind: "town",
        townId: "north-west",
      },
    );
    board = setCell(
      board,
      { x: 3, y: 2 },
      {
        kind: "town",
        townId: "north-west",
      },
    );
    board = addRoad(board, 3, 1);

    const model = createBoardRenderModel({ board });

    expect(model.towns).toEqual([
      {
        townId: "north-west",
        x: 300,
        y: 300,
        width: 200,
        height: 100,
      },
    ]);
    expect(
      model.connections.filter(({ kind }) => kind === "town-road"),
    ).toEqual([
      {
        key: "north-west|3,1",
        kind: "town-road",
        from: { x: 450, y: 250 },
        to: { x: 450, y: 350 },
        color: "blue",
        emphasis: "normal",
      },
    ]);
  });

  it("勝利に採用した街との接続を重ね描きせず強調状態にする", () => {
    let board = createEmptyBoard();
    board = setCell(
      board,
      { x: 2, y: 2 },
      {
        kind: "town",
        townId: "north-west",
      },
    );
    board = addRoad(board, 2, 1);
    const winResult: WinResult = {
      winner: "blue",
      roadPath: [{ x: 2, y: 1 }],
      townConnections: [
        { townId: "north-west", roadCell: { x: 2, y: 1 } },
        { townId: "south-east", roadCell: { x: 2, y: 1 } },
      ],
    };

    const townConnections = createBoardRenderModel({
      board,
      winResult,
    }).connections.filter(({ kind }) => kind === "town-road");

    expect(townConnections).toHaveLength(1);
    expect(townConnections[0]?.emphasis).toBe("winning");
  });

  it("勝利経路の道路と連続する辺だけを強調する", () => {
    let board = addRoad(createEmptyBoard(), 3, 3);
    board = addRoad(board, 4, 3);
    board = addRoad(board, 5, 3);
    board = addRoad(board, 4, 4);
    const winResult: WinResult = {
      winner: "blue",
      roadPath: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 5, y: 3 },
      ],
      townConnections: [
        { townId: "north-west", roadCell: { x: 3, y: 3 } },
        { townId: "south-east", roadCell: { x: 5, y: 3 } },
      ],
    };

    const model = createBoardRenderModel({ board, winResult });

    expect(
      model.roads.map(({ logicalCoordinate, emphasis }) => ({
        logicalCoordinate,
        emphasis,
      })),
    ).toEqual([
      { logicalCoordinate: { x: 3, y: 3 }, emphasis: "winning" },
      { logicalCoordinate: { x: 4, y: 3 }, emphasis: "winning" },
      { logicalCoordinate: { x: 5, y: 3 }, emphasis: "winning" },
      { logicalCoordinate: { x: 4, y: 4 }, emphasis: "muted" },
    ]);
    expect(
      model.connections.map(({ key, emphasis }) => ({ key, emphasis })),
    ).toEqual([
      { key: "4,4|5,4", emphasis: "winning" },
      { key: "4,4|5,5", emphasis: "muted" },
      { key: "5,4|6,4", emphasis: "winning" },
      { key: "5,4|5,5", emphasis: "muted" },
      { key: "6,4|5,5", emphasis: "muted" },
    ]);
  });
});
