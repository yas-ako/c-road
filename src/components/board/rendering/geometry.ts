export const SVG_CELL_SIZE = 100;
export const SVG_BOARD_SIZE = SVG_CELL_SIZE * 15;

export const BOARD_GEOMETRY = Object.freeze({
  cellSize: SVG_CELL_SIZE,
  roadInset: SVG_CELL_SIZE / 12,
  roadBorderWidth: 4,
  connectionWidth: 10,
  roadNumberSize: 40,
  townInset: 2,
  townBorderWidth: 4,
  gridWidth: 2,
});
