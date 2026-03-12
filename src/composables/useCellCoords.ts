/**
 * タイル番号(0~224) → X座標(0~12)
 */
export function cellX(no: number): number {
  const result = no % 15;
  const index = result === 0 ? 13 : result === 14 ? 1 : result;
  return index - 1;
}

/**
 * タイル番号(0~224) → Y座標(0~12)
 */
export function cellY(no: number): number {
  const result = Math.floor(no / 15);
  const index = result === 0 ? 13 : result === 14 ? 1 : result;
  return index - 1;
}

/**
 * 外周タイル（トーラスの折り返し表示用）かどうか
 */
export function isInEdge(no: number): boolean {
  if (no >= 0 && no <= 14) return true;
  if (no % 15 === 14) return true;
  if (no % 15 === 0) return true;
  if (no >= 210 && no <= 224) return true;
  return false;
}
