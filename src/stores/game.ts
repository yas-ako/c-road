import { defineStore } from "pinia";
import { shallowRef } from "vue";

import { applyAction, type GameEvent } from "~/game/actions";
import { createTownSetupGameState } from "~/game/state";
import type { Coordinate, TownId } from "~/game/types";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef(createTownSetupGameState());

  function extendTown(townId: TownId, coordinate: Coordinate): boolean {
    const result = applyAction(state.value, {
      type: "extend-town",
      player: state.value.currentPlayer,
      townId,
      coordinate,
    });
    if (!result.success) return false;

    state.value = result.state;
    return true;
  }

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
    state.value = createTownSetupGameState();
  }

  return { state, extendTown, placeRoad, reset };
});
