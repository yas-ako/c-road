import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { getCell } from "~/game/board";
import { getRoadPlacementRule } from "~/game/rules/placement";
import { useGameStore } from "~/stores/game";
import { useGamePresentationStore } from "~/stores/gamePresentation";
import { useNotificationStore } from "~/stores/notification";

export const useGameInteractionStore = defineStore("game-interaction", () => {
  const game = useGameStore();
  const presentation = useGamePresentationStore();
  const selectedCell = ref<[number, number]>([-1, -1]);
  const maxCellNumber = ref(10);

  const isEditable = computed(() => {
    const [x, y] = selectedCell.value;
    return (
      x >= 0 &&
      y >= 0 &&
      !presentation.isBeingRemoved &&
      getCell(game.state.board, { x, y }).kind === "empty"
    );
  });

  function selectCell(x: number, y: number) {
    if (presentation.isBeingRemoved) return;

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
    const events = game.placeRoad({ x, y }, level);
    if (events === undefined) return false;

    presentation.present(events);
    selectedCell.value = [-1, -1];
    return true;
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
