import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

import type { GameEvent } from "~/game/moveTypes";
import type { Board } from "~/game/types";
import { useGameStore } from "~/stores/game";
import { useNotificationStore } from "~/stores/notification";

export const useGamePresentationStore = defineStore("game-presentation", () => {
  const game = useGameStore();
  const presentationBoard = shallowRef<Board>();
  const isBeingRemoved = ref(false);
  const displayBoard = computed(
    () => presentationBoard.value ?? game.state.board,
  );
  let demolitionTimeoutId: ReturnType<typeof setTimeout> | undefined;

  function present(events: readonly GameEvent[]) {
    if (demolitionTimeoutId !== undefined) {
      clearTimeout(demolitionTimeoutId);
      demolitionTimeoutId = undefined;
    }

    const demolition = events.find((event) => event.type === "demolition");
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
    presentationBoard.value = undefined;
    isBeingRemoved.value = false;
  }

  return { displayBoard, isBeingRemoved, present, reset };
});
