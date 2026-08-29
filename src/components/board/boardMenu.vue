<template>
  <section class="road-input" aria-label="道路番号の入力">
    <div class="road-input__heading">
      <span class="road-input__label">道路番号</span>
      <output
        class="road-input__value"
        :class="{ 'text-slate-300': !interaction.isEditable }"
      >
        {{ selectedNumber }}
      </output>
    </div>

    <button
      type="button"
      class="road-input__step road-input__minus"
      aria-label="道路番号を1減らす"
      :disabled="!canDecrease"
      @click="selectedNumber--"
    >
      <svg viewBox="0 -960 960 960" aria-hidden="true">
        <path d="M200-440v-80h560v80H200Z" />
      </svg>
    </button>

    <div class="road-input__slider">
      <input
        v-model.number="selectedNumber"
        type="range"
        class="input-range"
        name="number_input"
        aria-label="道路番号"
        min="1"
        :max="interaction.maxCellNumber"
        step="1"
        :disabled="!interaction.isEditable"
      />
      <div
        class="road-input__scale"
        :class="{ 'text-slate-300': !interaction.isEditable }"
        aria-hidden="true"
      >
        <span>1</span>
        <span>{{ interaction.maxCellNumber }}</span>
      </div>
    </div>

    <button
      type="button"
      class="road-input__step road-input__plus"
      aria-label="道路番号を1増やす"
      :disabled="!canIncrease"
      @click="selectedNumber++"
    >
      <svg viewBox="0 -960 960 960" aria-hidden="true">
        <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
      </svg>
    </button>

    <button
      type="button"
      class="road-input__submit"
      :disabled="!interaction.isEditable"
      @click="clickSubmitButton"
    >
      <svg viewBox="0 -960 960 960" aria-hidden="true">
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
      </svg>
      <span>置く</span>
    </button>
  </section>
</template>

<script setup lang="ts">
  import { useGameInteractionStore } from "~/stores/gameInteraction";

  const interaction = useGameInteractionStore();
  const selectedNumber = ref(1);
  const canDecrease = computed(
    () => interaction.isEditable && selectedNumber.value > 1,
  );
  const canIncrease = computed(
    () =>
      interaction.isEditable &&
      selectedNumber.value < interaction.maxCellNumber,
  );

  function clickSubmitButton() {
    if (!interaction.isEditable) return;
    interaction.submitMove(selectedNumber.value);
  }

  watch(
    () => interaction.maxCellNumber,
    () => {
      selectedNumber.value = 1;
    },
  );
</script>

<style lang="scss" scoped>
  .road-input {
    display: grid;
    grid-template-areas:
      "heading heading heading submit"
      "minus slider plus submit";
    grid-template-columns: 3.25rem minmax(0, 1fr) 3.25rem 4.5rem;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem max(0.75rem, env(safe-area-inset-right))
      max(0.75rem, env(safe-area-inset-bottom))
      max(0.75rem, env(safe-area-inset-left));
    border-top: 1px solid rgb(226 232 240);
    background: rgb(255 255 255 / 96%);
    box-shadow: 0 -0.25rem 1rem rgb(15 23 42 / 8%);

    &__heading {
      grid-area: heading;
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.75rem;
      min-width: 0;
    }

    &__label {
      color: rgb(71 85 105);
      font-size: 0.875rem;
      font-weight: 600;
    }

    &__value {
      min-width: 2ch;
      color: rgb(15 23 42);
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
      text-align: center;
    }

    &__step,
    &__submit {
      min-width: 3rem;
      min-height: 3rem;
      border-radius: 0.75rem;
      transition:
        background-color 120ms ease,
        transform 120ms ease;

      &:focus-visible {
        outline: 3px solid rgb(132 204 22 / 45%);
        outline-offset: 2px;
      }

      &:active:not(:disabled) {
        transform: scale(0.96);
      }

      &:disabled {
        cursor: default;
        color: rgb(203 213 225);
        background: rgb(241 245 249);
      }

      svg {
        width: 2rem;
        height: 2rem;
        margin: auto;
        fill: currentColor;
      }
    }

    &__step {
      color: rgb(51 65 85);
      background: rgb(241 245 249);

      &:hover:not(:disabled) {
        background: rgb(226 232 240);
      }
    }

    &__minus {
      grid-area: minus;
    }

    &__plus {
      grid-area: plus;
    }

    &__slider {
      grid-area: slider;
      align-self: center;
      min-width: 0;
      padding-inline: 0.25rem;
    }

    &__scale {
      display: flex;
      justify-content: space-between;
      margin-top: 0.25rem;
      color: rgb(71 85 105);
      font-size: 0.75rem;
      line-height: 1;
    }

    &__submit {
      grid-area: submit;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.125rem;
      color: rgb(54 83 20);
      font-size: 0.75rem;
      font-weight: 700;
      background: rgb(163 230 53);

      &:hover:not(:disabled) {
        background: rgb(132 204 22);
      }
    }
  }

  .input-range {
    width: 100%;
    height: 2rem;
    appearance: none;
    cursor: pointer;
    background: transparent;

    &::-webkit-slider-runnable-track {
      height: 0.5rem;
      border-radius: 9999px;
      background: rgb(163 230 53);
    }

    &::-webkit-slider-thumb {
      width: 1.75rem;
      height: 1.75rem;
      margin-top: -0.625rem;
      appearance: none;
      border: 3px solid white;
      border-radius: 9999px;
      background: rgb(74 117 5);
      box-shadow: 0 1px 4px rgb(15 23 42 / 30%);
    }

    &::-moz-range-track {
      height: 0.5rem;
      border-radius: 9999px;
      background: rgb(163 230 53);
    }

    &::-moz-range-thumb {
      width: 1.4rem;
      height: 1.4rem;
      border: 3px solid white;
      border-radius: 9999px;
      background: rgb(74 117 5);
      box-shadow: 0 1px 4px rgb(15 23 42 / 30%);
    }

    &:focus-visible {
      outline: 3px solid rgb(132 204 22 / 40%);
      outline-offset: 2px;
      border-radius: 9999px;
    }

    &:disabled {
      cursor: default;

      &::-webkit-slider-runnable-track {
        background: rgb(226 232 240);
      }

      &::-webkit-slider-thumb {
        background: rgb(148 163 184);
      }

      &::-moz-range-track,
      &::-moz-range-thumb {
        background: rgb(148 163 184);
      }
    }
  }

  @media (orientation: landscape), (min-width: 56rem) {
    .road-input {
      grid-template-areas:
        "heading heading"
        "slider slider"
        "minus plus"
        "submit submit";
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-content: center;
      gap: 0.875rem;
      height: 100%;
      padding: 1.25rem;
      border-top: 0;
      box-shadow: none;

      &__heading {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      &__label {
        font-size: 1rem;
      }

      &__value {
        font-size: clamp(2.5rem, 8dvh, 4rem);
      }

      &__step {
        min-height: 3.5rem;
      }

      &__submit {
        flex-direction: row;
        min-height: 3.75rem;
        font-size: 1rem;

        svg {
          margin: 0;
        }
      }
    }
  }
</style>
