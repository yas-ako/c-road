import { defineStore } from "pinia";
import { shallowRef } from "vue";

import { applyAction, type GameEvent } from "~/game/actions";
import { createInitialGameState } from "~/game/state";
import type { Coordinate } from "~/game/types";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef(createInitialGameState());

  function placeRoad(
    coordinate: Coordinate,
    level: number,
  ): readonly GameEvent[] | undefined {
    const result = applyAction(state.value, {
      type: "place-road",
      player: state.value.currentPlayer,
      coordinate,
      level,
    });
    if (!result.success) return undefined;

    state.value = result.state;
    return result.events;
  }

  function reset() {
    state.value = createInitialGameState();
  }

  return { state, placeRoad, reset };
});
