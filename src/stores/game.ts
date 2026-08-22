import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

import { applyAction } from "~/game/actions";
import { getCell } from "~/game/board";
import { getRoadPlacementRule } from "~/game/rules/placement";
import { createInitialGameState } from "~/game/state";
import type { Board } from "~/game/types";
import { useNotificationStore } from "~/stores/notification";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef(createInitialGameState());

  const presentationBoard = shallowRef<Board>();
  const displayBoard = computed(
    () => presentationBoard.value ?? state.value.board,
  );

  const selectedCell = ref<[number, number]>([-1, -1]);
  const maxCellNumber = ref(10);
  const isBeingRemoved = ref(false);
  let demolitionTimeoutId: ReturnType<typeof setTimeout> | undefined;

  const selectedCellIsEmpty = computed(() => {
    const [x, y] = selectedCell.value;
    return (
      x >= 0 && y >= 0 && getCell(state.value.board, { x, y }).kind === "empty"
    );
  });

  const isEditable = computed(
    () => selectedCellIsEmpty.value && !isBeingRemoved.value,
  );

  function selectCell(x: number, y: number) {
    if (isBeingRemoved.value) return;

    if (selectedCell.value[0] === x && selectedCell.value[1] === y) {
      selectedCell.value = [-1, -1];
      return;
    }

    const placementRule = getRoadPlacementRule(state.value.board, { x, y });
    maxCellNumber.value = placementRule.maxLevel;
    selectedCell.value = [x, y];

    if (placementRule.limitedBySandwich) {
      useNotificationStore().show(0);
    }
  }

  function submitMove(level: number) {
    if (!isEditable.value) return;

    const [x, y] = selectedCell.value;
    const result = applyAction(state.value, {
      type: "place-road",
      player: state.value.currentPlayer,
      coordinate: { x, y },
      level,
    });
    if (!result.success) return;

    if (demolitionTimeoutId !== undefined) {
      clearTimeout(demolitionTimeoutId);
    }

    state.value = result.state;
    selectedCell.value = [-1, -1];

    const demolition = result.events.find(
      (event) => event.type === "demolition",
    );
    if (demolition === undefined) {
      presentationBoard.value = undefined;
      isBeingRemoved.value = false;
      return;
    }

    presentationBoard.value = demolition.boardBeforeDemolition;
    isBeingRemoved.value = true;
    useNotificationStore().show(1);
    demolitionTimeoutId = setTimeout(() => {
      presentationBoard.value = undefined;
      isBeingRemoved.value = false;
      demolitionTimeoutId = undefined;
    }, 2000);
  }

  function reset() {
    if (demolitionTimeoutId !== undefined) {
      clearTimeout(demolitionTimeoutId);
      demolitionTimeoutId = undefined;
    }
    state.value = createInitialGameState();
    presentationBoard.value = undefined;
    selectedCell.value = [-1, -1];
    maxCellNumber.value = 10;
    isBeingRemoved.value = false;
  }

  return {
    state,
    displayBoard,
    selectedCell,
    maxCellNumber,
    isBeingRemoved,
    isEditable,
    selectCell,
    submitMove,
    reset,
  };
});
