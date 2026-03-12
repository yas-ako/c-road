<template>
  <div class="flex items-stretch justify-between">
    <div class="flex w-full justify-between">
      <!-- 左のボタン -->
      <div class="mx-4 flex justify-center">
        <button
          class="my-auto rounded-md bg-slate-100 fill-current"
          :class="{
            'hover:bg-gray-300': game.isEditable && selectedNumber > 1,
            'cursor-default text-slate-300': !game.isEditable || selectedNumber === 1,
          }"
          @click="
            if (game.isEditable && selectedNumber > 1) {
              selectedNumber--;
            }
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="50px"
            viewBox="0 -960 960 960"
            width="50px"
          >
            <path d="M200-440v-80h560v80H200Z" />
          </svg>
        </button>
      </div>
      <!-- 中央の数字とスライダー -->
      <div class="grid h-full w-full grid-flow-row gap-3">
        <div
          class="mt-[max(2dvh,0.75rem)] text-center text-3xl"
          :class="{ 'text-slate-300': !game.isEditable }"
        >
          {{ selectedNumber }}
        </div>
        <!-- スライダー -->
        <input
          v-model="selectedNumber"
          type="range"
          class="input-range relative"
          :class="{
            'input-range_gray': !game.isEditable || game.maxCellNumber === 1,
          }"
          name="number_input"
          min="1"
          :max="game.maxCellNumber"
          step="1"
          :disabled="!game.isEditable"
        />
        <!-- 目盛り -->
        <div
          class="mb-[max(2dvh,0.75rem)] flex w-full justify-between text-xl"
          :class="{ 'text-slate-300': !game.isEditable }"
        >
          <div>1</div>
          <div>{{ game.maxCellNumber }}</div>
        </div>
      </div>
      <!-- 右のボタン -->
      <div class="mx-4 flex justify-center">
        <button
          class="my-auto rounded-md bg-slate-100 fill-current"
          :class="{
            'hover:bg-gray-300':
              game.isEditable && selectedNumber < game.maxCellNumber,
            'cursor-default text-slate-300':
              !game.isEditable || selectedNumber === game.maxCellNumber,
          }"
          @click="
            if (game.isEditable && selectedNumber < game.maxCellNumber) {
              selectedNumber++;
            }
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="50px"
            viewBox="0 -960 960 960"
            width="50px"
          >
            <path
              d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
            />
          </svg>
        </button>
      </div>
    </div>
    <!-- 入力完了ボタン -->
    <button
      class="flex aspect-square w-16 items-stretch lg:min-w-[20vw]"
      :class="{
        'bg-lime-400 text-lime-800 hover:bg-lime-500 active:bg-lime-600':
          game.isEditable,
        'cursor-default bg-slate-100 text-slate-300 ': !game.isEditable,
      }"
      @click="clickSubmitButton()"
    >
      <svg
        class="m-auto justify-center fill-current"
        xmlns="http://www.w3.org/2000/svg"
        height="50px"
        viewBox="0 -960 960 960"
        width="50px"
      >
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts" scoped>
  import { useGameStore } from "~/stores/game";

  const game = useGameStore();

  /**
   * スライダーでユーザーが選んだ数値（UI状態のためローカルに保持）
   */
  const selectedNumber = ref(1);

  function clickSubmitButton() {
    if (!game.isEditable) return;
    game.submitMove(selectedNumber.value);
  }

  // maxCellNumber が変わったらスライダーを1にリセット
  watch(
    () => game.maxCellNumber,
    () => {
      selectedNumber.value = 1;
    },
  );
</script>

<style lang="scss" scoped>
  .input-range {
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    background: rgb(163 230 53);
    height: 20px;
    width: 100%;
    border: solid 3px rgb(163 230 53);
    outline: 0;

    &.input-range_gray {
      background: rgb(241 245 249);
      border: rgb(241 245 249);
      pointer-events: none;
      &::-webkit-slider-thumb {
        background: rgb(203 213 225);
      }
    }
    &::-moz-range-thumb {
      background: rgb(203 213 225);
    }

    &:focus {
      outline: 1px solid;
      outline-color: rgba(162, 230, 53, 0.4);
      outline-offset: 2px;
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: #4a7505;
      width: 10px;
      height: 35px;
      border-radius: 0%;
    }
    &::-moz-range-thumb {
      background: #4a7505;
      width: 10px;
      height: 35px;
      border-radius: 0%;
      border: none;
    }
    &::-moz-focus-outer {
      border: 0;
    }
    &:active::-webkit-slider-thumb {
      box-shadow: 0px 5px 10px -2px rgba(0, 0, 0, 0.3);
    }
  }
</style>
