import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

import { applyAction } from "~/game/actions";
import { createInitialGameState } from "~/game/state";
import type { Board, Coordinate } from "~/game/types";
import { useNotificationStore } from "~/stores/notification";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef(createInitialGameState());
  const presentationBoard = shallowRef<Board>();
  const displayBoard = computed(
    () => presentationBoard.value ?? state.value.board,
  );
  const isBeingRemoved = ref(false);
  let demolitionTimeoutId: ReturnType<typeof setTimeout> | undefined;

  function placeRoad(coordinate: Coordinate, level: number): boolean {
    if (isBeingRemoved.value) return false;

    const result = applyAction(state.value, {
      type: "place-road",
      player: state.value.currentPlayer,
      coordinate,
      level,
    });
    if (!result.success) return false;

    if (demolitionTimeoutId !== undefined) {
      clearTimeout(demolitionTimeoutId);
    }

    state.value = result.state;
    const demolition = result.events.find(
      (event) => event.type === "demolition",
    );
    if (demolition === undefined) {
      presentationBoard.value = undefined;
      isBeingRemoved.value = false;
      return true;
    }

    presentationBoard.value = demolition.boardBeforeDemolition;
    isBeingRemoved.value = true;
    useNotificationStore().show(1);
    demolitionTimeoutId = setTimeout(() => {
      presentationBoard.value = undefined;
      isBeingRemoved.value = false;
      demolitionTimeoutId = undefined;
    }, 2000);
    return true;
  }

  function reset() {
    if (demolitionTimeoutId !== undefined) {
      clearTimeout(demolitionTimeoutId);
      demolitionTimeoutId = undefined;
    }
    state.value = createInitialGameState();
    presentationBoard.value = undefined;
    isBeingRemoved.value = false;
  }

  return {
    state,
    displayBoard,
    isBeingRemoved,
    placeRoad,
    reset,
  };
});
