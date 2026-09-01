import { defineStore } from "pinia";
import { shallowRef } from "vue";

import { townConnectionGame } from "~/game/modes/townConnection/game";
import type { GameEvent } from "~/game/moveTypes";
import type { Coordinate, TownId } from "~/game/types";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef(townConnectionGame.createInitialState());

  function extendTown(townId: TownId, coordinate: Coordinate): boolean {
    const result = townConnectionGame.applyMove(state.value, {
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
    const result = townConnectionGame.applyMove(state.value, {
      type: "place-road",
      player: state.value.currentPlayer,
      coordinate,
      level,
    });
    if (!result.success) return undefined;

    state.value = result.state;
    return result.events;
  }

  function resign(): boolean {
    const result = townConnectionGame.resign(
      state.value,
      state.value.currentPlayer,
    );
    if (!result.success) return false;

    state.value = result.state;
    return true;
  }

  function reset() {
    state.value = townConnectionGame.createInitialState();
  }

  return { state, extendTown, placeRoad, resign, reset };
});
