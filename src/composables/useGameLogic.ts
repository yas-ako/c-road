/**
 * ゲームロジックの純粋関数群
 * ストアやコンポーネントに依存しないため、単体テストが容易
 */

/**
 * 方向定義（boardTile.vueの既存インデックス体系を維持）
 * ```
 * 0  1  2
 * 3  -  5
 * 6  7  8
 * ```
 */
const DIRECTIONS: { [key: number]: [number, number] } = {
  0: [-1, -1],
  1: [0, -1],
  2: [1, -1],
  3: [-1, 0],
  5: [1, 0],
  6: [-1, 1],
  7: [0, 1],
  8: [1, 1],
};

/**
 * 向かい合うペアのインデックス（上限ルール用）
 */
const FACING_PAIRS: [number, number][] = [
  [0, 8],
  [1, 7],
  [2, 6],
  [3, 5],
];

export type UpperLimitResult = {
  maxNumber: number;
  notificationType: number; // 0: 上限ルール発動, -1: 通常
};

/**
 * 上限ルールの計算
 * @param cellData 13×13のボードデータ
 * @param x クリックされたマスのX座標
 * @param y クリックされたマスのY座標
 */
export function calcUpperLimit(
  cellData: number[][],
  x: number,
  y: number,
): UpperLimitResult {
  // 8近傍の絶対値を取得
  const neighborValues: { [key: number]: number } = {};
  for (const [keyStr, [dx, dy]] of Object.entries(DIRECTIONS)) {
    const key = Number(keyStr);
    const nx = (x + dx + 13) % 13;
    const ny = (y + dy + 13) % 13;
    neighborValues[key] = Math.abs(cellData[nx]?.[ny] ?? 0);
  }

  // 隣接最大値 + 1 を初期値とする
  let maxNumber = Math.max(0, ...Object.values(neighborValues)) + 1;

  // 向かい合うペアが同じ値なら上限ルール発動
  let minFacingPair = 1000;
  for (const [j, k] of FACING_PAIRS) {
    const jVal = neighborValues[j] ?? 0;
    const kVal = neighborValues[k] ?? 0;
    if (jVal === kVal && jVal !== 0 && jVal < minFacingPair) {
      minFacingPair = jVal;
    }
  }

  let notificationType = -1;
  if (minFacingPair !== 1000) {
    maxNumber = minFacingPair;
    notificationType = 0;
  }

  return { maxNumber, notificationType };
}

export type Coordinate = { x: number; y: number };

/**
 * 取り壊しルールの計算
 * @param cellData 13×13のボードデータ
 * @returns 取り壊し対象のマス座標リスト
 */
export function calcDemolition(cellData: number[][]): Coordinate[] {
  const removedList: Coordinate[] = [];

  for (let x = 0; x < 13; x++) {
    for (let y = 0; y < 13; y++) {
      const n = Math.abs(cellData[x]?.[y] ?? 0);

      if (n <= 1) continue;

      for (const [dx, dy] of Object.values(DIRECTIONS)) {
        const currentChain: Coordinate[] = [];
        let step = 1;

        while (true) {
          const nx = (x + dx * step + 13) % 13;
          const ny = (y + dy * step + 13) % 13;

          // 起点に戻ってきた場合
          if (nx === x && ny === y) {
            if (currentChain.length > 0) {
              removedList.push(...currentChain);
            }
            break;
          }

          const currentValue = Math.abs(cellData[nx]?.[ny] ?? 0);

          if (step === 1) {
            if (currentValue !== n - 1) break;
            currentChain.push({ x: nx, y: ny });
          } else if (currentValue === n - 1) {
            currentChain.push({ x: nx, y: ny });
          } else if (currentValue === n) {
            if (currentChain.length > 0) {
              removedList.push(...currentChain);
            }
            break;
          } else {
            break;
          }
          step++;
        }
      }
    }
  }

  return removedList;
}
