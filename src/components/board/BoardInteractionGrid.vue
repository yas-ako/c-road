<template>
  <div class="board-interaction-grid" role="grid" aria-label="C*-roadの盤面">
    <button
      v-for="(_, index) in DISPLAY_BOARD_SIZE * DISPLAY_BOARD_SIZE"
      :key="index"
      ref="cellButtons"
      type="button"
      role="gridcell"
      class="board-hit-area"
      :tabindex="focusedIndex === index ? 0 : -1"
      :aria-label="cellLabel(index)"
      :aria-pressed="isSelected(index)"
      @click="selectDisplayCell(index)"
      @focus="focusedIndex = index"
      @keydown="handleKeydown($event, index)"
    ></button>
  </div>
</template>

<script setup lang="ts">
  import { displayToLogicalCoordinate } from "~/components/board/rendering/createBoardRenderModel";
  import { DISPLAY_BOARD_SIZE } from "~/game/types";
  import { useGameInteractionStore } from "~/stores/gameInteraction";

  const interaction = useGameInteractionStore();
  const focusedIndex = ref(Math.floor(DISPLAY_BOARD_SIZE ** 2 / 2));
  const cellButtons = ref<HTMLButtonElement[]>([]);

  function displayCoordinate(index: number) {
    return {
      x: index % DISPLAY_BOARD_SIZE,
      y: Math.floor(index / DISPLAY_BOARD_SIZE),
    };
  }

  function logicalCoordinate(index: number) {
    return displayToLogicalCoordinate(displayCoordinate(index));
  }

  function selectDisplayCell(index: number) {
    const coordinate = logicalCoordinate(index);
    interaction.selectCell(coordinate.x, coordinate.y);
  }

  function isSelected(index: number): boolean {
    const coordinate = logicalCoordinate(index);
    return (
      interaction.selectedCell[0] === coordinate.x &&
      interaction.selectedCell[1] === coordinate.y
    );
  }

  function cellLabel(index: number): string {
    const display = displayCoordinate(index);
    const logical = logicalCoordinate(index);
    const isEdge =
      display.x === 0 ||
      display.y === 0 ||
      display.x === DISPLAY_BOARD_SIZE - 1 ||
      display.y === DISPLAY_BOARD_SIZE - 1;
    return `${logical.y + 1}行${logical.x + 1}列${isEdge ? "、外周の複製" : ""}`;
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const direction =
      event.key === "ArrowLeft"
        ? { x: -1, y: 0 }
        : event.key === "ArrowRight"
          ? { x: 1, y: 0 }
          : event.key === "ArrowUp"
            ? { x: 0, y: -1 }
            : event.key === "ArrowDown"
              ? { x: 0, y: 1 }
              : undefined;
    if (direction === undefined) return;

    event.preventDefault();
    const current = displayCoordinate(index);
    const next = {
      x: Math.min(DISPLAY_BOARD_SIZE - 1, Math.max(0, current.x + direction.x)),
      y: Math.min(DISPLAY_BOARD_SIZE - 1, Math.max(0, current.y + direction.y)),
    };
    focusedIndex.value = next.y * DISPLAY_BOARD_SIZE + next.x;
    nextTick(() => cellButtons.value[focusedIndex.value]?.focus());
  }
</script>

<style scoped>
  .board-interaction-grid {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(15, minmax(0, 1fr));
    grid-template-rows: repeat(15, minmax(0, 1fr));
  }

  .board-hit-area {
    min-width: 0;
    min-height: 0;
    padding: 0;
    border: 0;
    background: transparent;
    touch-action: manipulation;

    &:focus-visible {
      outline: 3px solid rgb(132 204 22 / 70%);
      outline-offset: -3px;
    }
  }
</style>
