<template>
  <dialog
    ref="dialog"
    class="resignation-dialog"
    aria-labelledby="resignation-dialog-title"
    aria-describedby="resignation-dialog-description"
    @cancel="handleCancel"
    @click="handleBackdropClick"
  >
    <div class="resignation-dialog__panel">
      <span class="resignation-dialog__eyebrow">投了の確認</span>
      <h2 id="resignation-dialog-title">本当に投了しますか？</h2>
      <p id="resignation-dialog-description">
        {{ currentPlayerLabel }}が投了すると、{{
          winnerLabel
        }}の勝利になります。
      </p>
      <div class="resignation-dialog__actions">
        <button
          type="button"
          class="resignation-dialog__cancel"
          autofocus
          @click="emit('cancel')"
        >
          対局に戻る
        </button>
        <button
          type="button"
          class="resignation-dialog__confirm"
          @click="emit('confirm')"
        >
          投了する
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import type { PlayerColor } from "~/game/types";

  const props = defineProps<{
    open: boolean;
    currentPlayer: PlayerColor;
  }>();

  const emit = defineEmits<{
    cancel: [];
    confirm: [];
    closed: [];
  }>();

  const dialog = useTemplateRef<HTMLDialogElement>("dialog");
  let returnFocusTo: HTMLElement | null = null;

  const currentPlayerLabel = computed(() =>
    props.currentPlayer === "blue" ? "青" : "赤",
  );
  const winnerLabel = computed(() =>
    props.currentPlayer === "blue" ? "赤" : "青",
  );

  watch(
    () => props.open,
    async (open, _previousOpen, onCleanup) => {
      let obsolete = false;
      onCleanup(() => {
        obsolete = true;
      });

      if (open) {
        returnFocusTo =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        await nextTick();
        if (obsolete || !props.open) return;

        const element = dialog.value;
        if (element !== null && !element.open) element.showModal();
        return;
      }

      const element = dialog.value;
      const focusTarget = returnFocusTo;
      if (element?.open !== true && focusTarget === null) return;

      if (element?.open) element.close();
      await nextTick();
      if (obsolete || props.open) return;

      if (focusTarget?.isConnected) {
        focusTarget.focus();
      } else {
        emit("closed");
      }
      if (returnFocusTo === focusTarget) returnFocusTo = null;
    },
    { immediate: true },
  );

  function handleCancel(event: Event) {
    event.preventDefault();
    emit("cancel");
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) emit("cancel");
  }
</script>

<style scoped lang="scss">
  .resignation-dialog {
    width: min(28rem, calc(100dvw - 2rem));
    max-width: none;
    padding: 0;
    border: 0;
    border-radius: 1rem;
    color: rgb(30 41 59);
    background: white;
    box-shadow: 0 1.5rem 4rem rgb(15 23 42 / 30%);

    &::backdrop {
      background: rgb(15 23 42 / 50%);
      backdrop-filter: blur(2px);
    }

    &__panel {
      padding: 1.5rem;
    }

    &__eyebrow {
      color: rgb(100 116 139);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    h2 {
      margin-top: 0.25rem;
      font-size: 1.25rem;
      font-weight: 700;
    }

    p {
      margin-top: 0.75rem;
      color: rgb(71 85 105);
      font-size: 0.875rem;
      line-height: 1.6;
    }

    &__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    &__cancel,
    &__confirm {
      min-height: 2.75rem;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      font-weight: 700;

      &:focus-visible {
        outline: 3px solid rgb(148 163 184 / 45%);
        outline-offset: 2px;
      }
    }

    &__cancel {
      color: rgb(51 65 85);
      background: rgb(241 245 249);

      &:hover {
        background: rgb(226 232 240);
      }
    }

    &__confirm {
      color: white;
      background: rgb(185 28 28);

      &:hover {
        background: rgb(153 27 27);
      }

      &:focus-visible {
        outline-color: rgb(220 38 38 / 40%);
      }
    }
  }

  @media (max-width: 30rem) {
    .resignation-dialog {
      &__panel {
        padding: 1.25rem;
      }

      &__actions {
        flex-direction: column;
      }

      &__cancel,
      &__confirm {
        width: 100%;
      }
    }
  }
</style>
