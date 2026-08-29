<template>
  <div class="board-renderer">
    <BoardSvg :model="model" />
    <BoardInteractionGrid />
  </div>
</template>

<script setup lang="ts">
  import { createBoardRenderModel } from "~/components/board/rendering/createBoardRenderModel";
  import { useGameStore } from "~/stores/game";
  import { useGameInteractionStore } from "~/stores/gameInteraction";
  import { useGamePresentationStore } from "~/stores/gamePresentation";

  const game = useGameStore();
  const interaction = useGameInteractionStore();
  const presentation = useGamePresentationStore();

  const selectedCell = computed(() => {
    const [x, y] = interaction.selectedCell;
    return x < 0 || y < 0 ? undefined : { x, y };
  });

  const model = computed(() =>
    createBoardRenderModel({
      board: presentation.displayBoard,
      selectedCell: selectedCell.value,
      townCandidates: interaction.townCandidates,
      currentPlayer: game.state.currentPlayer,
      winResult: presentation.isBeingRemoved ? null : game.state.winResult,
    }),
  );
</script>

<style scoped>
  .board-renderer {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
