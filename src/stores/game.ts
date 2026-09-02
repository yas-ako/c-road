import { defineStore } from "pinia";
import { shallowRef } from "vue";

import {
  applyGameMove,
  applyResignation,
  createGameState,
  DEFAULT_GAME_MODE,
} from "~/game/gameModes";
import type { GameEvent, GameMove } from "~/game/moveTypes";
import type { GameState } from "~/game/state";
import type { Coordinate, PlayerColor, TownId } from "~/game/types";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef<GameState>(createGameState(DEFAULT_GAME_MODE));

  function playMove(move: GameMove): readonly GameEvent[] | undefined {
    const result = applyGameMove(state.value, move);
    if (!result.success) return undefined;

    state.value = result.state;
    return result.events;
  }

  function extendTown(townId: TownId, coordinate: Coordinate): boolean {
    if (state.value.mode !== "town-connection") return false;

    return (
      playMove({
        type: "extend-town",
        player: state.value.currentPlayer,
        townId,
        coordinate,
      }) !== undefined
    );
  }

  function placeRoad(
    coordinate: Coordinate,
    level: number,
  ): readonly GameEvent[] | undefined {
    return playMove({
      type: "place-road",
      player: state.value.currentPlayer,
      coordinate,
      level,
    });
  }

  function resign(player: PlayerColor): boolean {
    const result = applyResignation(state.value, player);
    if (!result.success) return false;

    state.value = result.state;
    return true;
  }

  return { state, playMove, extendTown, placeRoad, resign };
});
