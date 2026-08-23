import { BOARD_SIZE, type Board, type TownId } from "~/game/types";

export type TownOverlay = Readonly<{
  townId: TownId;
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
}>;

const TOWN_IDS: readonly TownId[] = ["north-west", "south-east"];

export function getTownOverlays(board: Board): readonly TownOverlay[] {
  return TOWN_IDS.flatMap((townId) => {
    const coordinates: Array<{ x: number; y: number }> = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const cell = board[x]?.[y];
        if (cell?.kind === "town" && cell.townId === townId) {
          coordinates.push({ x, y });
        }
      }
    }

    if (coordinates.length === 0) return [];

    const xValues = coordinates.map(({ x }) => x);
    const yValues = coordinates.map(({ y }) => y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return [
      {
        townId,
        // 15×15表示盤面の先頭には、反対側を複製した外周マスが1列ある。
        column: minX + 2,
        row: minY + 2,
        columnSpan: maxX - minX + 1,
        rowSpan: maxY - minY + 1,
      },
    ];
  });
}
