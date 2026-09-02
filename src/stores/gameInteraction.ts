import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

import { getCell } from "~/game/board";
import { getRoadPlacementRule } from "~/game/rules/placement";
import {
  getActiveTownId,
  getTownExtensionCandidates,
} from "~/game/rules/townPlacement";
import type { GameState } from "~/game/state";
import type { PlayerColor, TownId } from "~/game/types";
import { useGameStore } from "~/stores/game";
import { useGamePresentationStore } from "~/stores/gamePresentation";
import { useNotificationStore } from "~/stores/notification";

export const useGameInteractionStore = defineStore("game-interaction", () => {
  const game = useGameStore();
  const presentation = useGamePresentationStore();
  const selectedCell = ref<[number, number]>([-1, -1]);
  const maxCellNumber = ref(10);
  const pendingResignation = shallowRef<{
    player: PlayerColor;
    state: GameState;
  }>();
  const isResignationConfirmationOpen = computed(
    () => pendingResignation.value !== undefined,
  );
  const resigningPlayer = computed(() => pendingResignation.value?.player);

  const activeTownId = computed<TownId | undefined>(
    () => getActiveTownId(game.state) ?? undefined,
  );

  const townCandidates = computed(() =>
    activeTownId.value === undefined
      ? []
      : getTownExtensionCandidates(game.state, activeTownId.value),
  );

  const isEditable = computed(() => {
    const [x, y] = selectedCell.value;
    return (
      x >= 0 &&
      y >= 0 &&
      game.state.result === null &&
      game.state.phase === "placing-roads" &&
      !presentation.isBeingRemoved &&
      getCell(game.state.board, { x, y }).kind === "empty"
    );
  });

  function selectCell(x: number, y: number) {
    if (presentation.isBeingRemoved || game.state.result !== null) return;

    if (activeTownId.value !== undefined) {
      if (isTownCandidate(x, y)) {
        game.extendTown(activeTownId.value, { x, y });
      }
      selectedCell.value = [-1, -1];
      return;
    }

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

  function isTownCandidate(x: number, y: number): boolean {
    return townCandidates.value.some(
      (coordinate) => coordinate.x === x && coordinate.y === y,
    );
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

  function requestResignation(): boolean {
    if (presentation.isBeingRemoved || game.state.result !== null) return false;

    pendingResignation.value = {
      player: game.state.currentPlayer,
      state: game.state,
    };
    return true;
  }

  function cancelResignation() {
    pendingResignation.value = undefined;
  }

  function confirmResignation(): boolean {
    const pending = pendingResignation.value;
    if (pending === undefined) return false;

    pendingResignation.value = undefined;
    if (
      presentation.isBeingRemoved ||
      game.state.result !== null ||
      game.state !== pending.state ||
      game.state.currentPlayer !== pending.player
    ) {
      return false;
    }
    return game.resign(pending.player);
  }

  function reset() {
    selectedCell.value = [-1, -1];
    maxCellNumber.value = 10;
    pendingResignation.value = undefined;
  }

  return {
    selectedCell,
    maxCellNumber,
    isResignationConfirmationOpen,
    resigningPlayer,
    activeTownId,
    townCandidates,
    isEditable,
    isTownCandidate,
    selectCell,
    submitMove,
    requestResignation,
    cancelResignation,
    confirmResignation,
    reset,
  };
});
