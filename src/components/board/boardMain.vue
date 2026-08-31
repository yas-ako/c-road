<template>
  <transition name="slide-fade">
    <div
      v-if="notification.isVisible"
      :key="notification.key"
      class="notification"
    >
      <p class="heading">
        {{ notification.text[0] }}
      </p>
      <p>{{ notification.text[1] }}</p>
    </div>
  </transition>
  <section class="game-shell">
    <main class="board-viewport">
      <div class="game-board">
        <BoardRenderer />
      </div>
    </main>
    <aside class="control-panel">
      <div v-if="visibleResult !== null" class="game-result" role="status">
        <span class="game-result__label">{{ resultLabel }}</span>
        <strong
          v-if="visibleResult.type === 'win'"
          :class="`game-result__winner--${visibleResult.winner}`"
        >
          {{ visibleResult.winner === "blue" ? "青" : "赤" }}の勝利
        </strong>
        <strong v-else>引き分け</strong>
        <span class="game-result__description">{{ resultDescription }}</span>
        <button
          type="button"
          class="game-result__restart"
          @click="gameSession.reset"
        >
          新しいゲーム
        </button>
      </div>
      <boardMenu v-else-if="game.state.phase === 'placing-roads'" />
      <div v-else class="town-instruction">
        <span class="town-instruction__turn">
          {{
            game.state.phase === "placing-north-west-town" ? "青の番" : "赤の番"
          }}
        </span>
        <strong>街の向きを選んでください</strong>
        <span>薄い灰色のマスを選択します</span>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts" scoped>
  import { useGameSession } from "~/composables/useGameSession";
  import { useNotificationStore } from "~/stores/notification";
  import { useGameStore } from "~/stores/game";
  import { useGamePresentationStore } from "~/stores/gamePresentation";

  const game = useGameStore();
  const notification = useNotificationStore();
  const presentation = useGamePresentationStore();
  const gameSession = useGameSession();
  const visibleResult = computed(() =>
    presentation.isBeingRemoved ? null : game.state.result,
  );
  const resultLabel = computed(() =>
    visibleResult.value?.type === "draw" ? "結果" : "勝者",
  );
  const resultDescription = computed(() => {
    const result = visibleResult.value;
    if (result === null) return "";
    if (result.type === "draw") return "道を置けるマスがなくなりました";
    if (result.condition === "resignation") return "相手が投了しました";
    return "2つの街を道路でつなぎました";
  });
</script>

<style lang="scss" scoped>
  .game-shell {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: rgb(248 250 252);
  }

  .board-viewport {
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    padding: 0.5rem;
    overscroll-behavior: contain;
  }

  .game-board {
    position: relative;
    aspect-ratio: 1;
    width: min(100%, calc(100dvh - 12rem), 48rem);
    min-width: 42rem;
    min-height: 42rem;
    margin: auto;
    flex: none;
    background-color: #e7e7e7;
  }

  .control-panel {
    position: relative;
    z-index: 20;
    flex: none;
  }

  .town-instruction {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.875rem max(1rem, env(safe-area-inset-right))
      max(0.875rem, env(safe-area-inset-bottom))
      max(1rem, env(safe-area-inset-left));
    border-top: 1px solid rgb(226 232 240);
    color: rgb(51 65 85);
    background: white;
    box-shadow: 0 -0.25rem 1rem rgb(15 23 42 / 8%);

    &__turn {
      color: rgb(71 85 105);
      font-size: 0.875rem;
    }

    strong {
      font-size: 1rem;
    }

    span:last-child {
      color: rgb(100 116 139);
      font-size: 0.75rem;
    }
  }

  .game-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem max(1rem, env(safe-area-inset-right))
      max(1rem, env(safe-area-inset-bottom))
      max(1rem, env(safe-area-inset-left));
    border-top: 1px solid rgb(226 232 240);
    background: white;
    box-shadow: 0 -0.25rem 1rem rgb(15 23 42 / 8%);

    &__label,
    &__description {
      color: rgb(100 116 139);
      font-size: 0.75rem;
    }

    strong {
      font-size: 1.25rem;
    }

    &__winner--blue {
      color: var(--blue-color-dark);
    }

    &__winner--red {
      color: var(--red-color-dark);
    }

    &__restart {
      min-height: 2.75rem;
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      color: rgb(54 83 20);
      font-weight: 700;
      background: rgb(163 230 53);

      &:hover {
        background: rgb(132 204 22);
      }

      &:focus-visible {
        outline: 3px solid rgb(132 204 22 / 45%);
        outline-offset: 2px;
      }
    }
  }

  @media (orientation: landscape), (min-width: 56rem) {
    .game-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(17rem, 28vw, 22rem);
    }

    .board-viewport {
      padding: 0.75rem;
    }

    .game-board {
      width: min(100%, calc(100dvh - 4.5rem), 64rem);
    }

    .control-panel {
      min-width: 0;
      min-height: 0;
      overflow-y: auto;
      border-left: 1px solid rgb(226 232 240);
      background: white;
    }

    .town-instruction {
      justify-content: center;
      height: 100%;
      padding: 1.5rem;
      border-top: 0;
      text-align: center;
      box-shadow: none;

      strong {
        font-size: clamp(1rem, 3.5dvh, 1.25rem);
      }
    }

    .game-result {
      justify-content: center;
      height: 100%;
      border-top: 0;
      box-shadow: none;
    }
  }

  @media (min-width: 56rem) {
    .game-board {
      min-width: 30rem;
      min-height: 30rem;
    }
  }

  /* 通知のデザイン */
  .notification {
    position: fixed;
    z-index: 30;
    top: 70px;
    right: 20px;
    background: rgba(132, 204, 22, 0.8);
    color: rgb(45, 70, 11);
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    max-width: 50dvw;

    .heading {
      margin-bottom: 5px;
      font-weight: bold;
      font-size: 16px;
    }
  }

  /* スライドイン & フェードアウトのアニメーション */
  .slide-fade-enter-active {
    transition:
      transform 0.5s ease-out,
      opacity 0.5s ease-out;
  }
  .slide-fade-leave-active {
    transition: opacity 0.5s ease-out;
  }
  .slide-fade-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }
  .slide-fade-leave-to {
    opacity: 0;
  }
</style>
