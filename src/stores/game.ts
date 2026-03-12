import { calcUpperLimit, calcDemolition } from "~/composables/useGameLogic";

export const useGameStore = defineStore("game", () => {
  // ────────────── State ──────────────

  /**
   * 13×13のマス目データ（青=正数, 赤=負数, 空=0）
   */
  const cellData = ref<number[][]>(
    [...Array(13)].map(() => Array(13).fill(0)),
  );

  /**
   * 手番（1=青, -1=赤）
   */
  const side = ref<number>(1);

  /**
   * 選択中のマスの座標（[-1, -1]=未選択）
   */
  const selectedCell = ref<[number, number]>([-1, -1]);

  /**
   * 選択中のマスへの入力上限値
   */
  const maxCellNumber = ref<number>(10);

  /**
   * 取り壊し処理中フラグ（true中はタイル操作不可）
   */
  const isBeingRemoved = ref<boolean>(false);

  // ────────────── Getters ──────────────

  /**
   * 選択中のマスの現在値（未選択時は1000）
   */
  const selectedCellNumber = computed<number>(() => {
    if (selectedCell.value[0] < 0) return 1000;
    return cellData.value[selectedCell.value[0]]?.[selectedCell.value[1]] ?? 1000;
  });

  /**
   * 数値入力が可能かどうか
   */
  const isEditable = computed<boolean>(
    () =>
      selectedCell.value[0] !== -1 &&
      selectedCell.value[1] !== -1 &&
      selectedCellNumber.value === 0,
  );

  // ────────────── Actions ──────────────

  /**
   * タイル選択・解除
   * 上限ルールの計算も行い、maxCellNumber を更新する
   */
  function selectCell(x: number, y: number): void {
    if (isBeingRemoved.value) return;

    // 同じマスを再クリック → 選択解除
    if (selectedCell.value[0] === x && selectedCell.value[1] === y) {
      selectedCell.value = [-1, -1];
      return;
    }

    const { maxNumber, notificationType } = calcUpperLimit(cellData.value, x, y);
    maxCellNumber.value = maxNumber;
    selectedCell.value = [x, y];

    if (notificationType === 0) {
      useNotificationStore().show(0);
    }
  }

  /**
   * 数値を確定する
   * 手番交代・取り壊しルールの計算・実行を行う
   */
  function submitMove(value: number): void {
    const [x, y] = selectedCell.value;
    const row = cellData.value[x];
    if (row) row[y] = value * side.value;

    side.value *= -1;
    selectedCell.value = [-1, -1];
    isBeingRemoved.value = true;

    const removedList = calcDemolition(cellData.value);

    if (removedList.length > 0) {
      useNotificationStore().show(1);
      setTimeout(() => {
        for (const coord of removedList) {
          const r = cellData.value[coord.x];
          if (r) r[coord.y] = 0;
        }
        isBeingRemoved.value = false;
      }, 2000);
    } else {
      isBeingRemoved.value = false;
    }
  }

  /**
   * ゲームをリセットする
   */
  function resetGame(): void {
    cellData.value = [...Array(13)].map(() => Array(13).fill(0));
    side.value = 1;
    selectedCell.value = [-1, -1];
    maxCellNumber.value = 10;
    isBeingRemoved.value = false;
  }

  return {
    // State
    cellData,
    side,
    selectedCell,
    maxCellNumber,
    isBeingRemoved,
    // Getters
    selectedCellNumber,
    isEditable,
    // Actions
    selectCell,
    submitMove,
    resetGame,
  };
});
