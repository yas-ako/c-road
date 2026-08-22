import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { getCell } from "~/game/board";
import { getRoadPlacementRule } from "~/game/rules/placement";
import { useGameStore } from "~/stores/game";
import { useNotificationStore } from "~/stores/notification";

export const useGameInteractionStore = defineStore("game-interaction", () => {
  const game = useGameStore();
  const selectedCell = ref<[number, number]>([-1, -1]);
  const maxCellNumber = ref(10);

  const isEditable = computed(() => {
    const [x, y] = selectedCell.value;
    return (
      x >= 0 &&
      y >= 0 &&
      !game.isBeingRemoved &&
      getCell(game.state.board, { x, y }).kind === "empty"
    );
  });

  function selectCell(x: number, y: number) {
    if (game.isBeingRemoved) return;

    if (selectedCell.value[0] === x && selectedCell.value[1] === y) {
      selectedCell.value = [-1, -1];
      return;
    }

    const placementRule = getRoadPlacementRule(game.state.board, { x, y });
    maxCellNumber.value = placementRule.maxLevel;
    selectedCell.value = [x, y];

    if (placementRule.limitedBySandwich) {
      useNotificationStore().show(0);
    }
  }

  function submitMove(level: number): boolean {
    if (!isEditable.value) return false;

    const [x, y] = selectedCell.value;
    const wasPlaced = game.placeRoad({ x, y }, level);
    if (wasPlaced) selectedCell.value = [-1, -1];
    return wasPlaced;
  }

  function reset() {
    selectedCell.value = [-1, -1];
    maxCellNumber.value = 10;
  }

  return {
    selectedCell,
    maxCellNumber,
    isEditable,
    selectCell,
    submitMove,
    reset,
  };
});
