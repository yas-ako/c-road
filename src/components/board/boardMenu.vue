<template>
  <div class="flex items-stretch justify-between">
    <div class="flex w-full justify-between">
      <!-- 左のボタン -->
      <div class="mx-4 flex justify-center">
        <button
          class="my-auto rounded-md bg-slate-100 fill-current"
          :class="{
            'hover:bg-gray-300': isEditable && selectedNumber > 1,
            'cursor-default text-slate-300': !isEditable || selectedNumber == 1,
          }"
          @click="
            if (isEditable && selectedNumber > 1) {
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
          :class="{ 'text-slate-300': !isEditable }"
        >
          {{ selectedNumber }}
        </div>
        <!-- <div class="mb-[max(5dvh,2.5rem)] flex flex-col"> -->
        <!-- スライダー -->
        <input
          v-model="selectedNumber"
          type="range"
          class="input-range relative"
          :class="{
            'input-range_gray': !isEditable || menuPorps.maxCellNumber == 1,
          }"
          name="number_input"
          min="1"
          :max="menuPorps.maxCellNumber"
          step="1"
          :value="1"
          :disabled="!isEditable"
        />
        <!-- 目盛り -->
        <div
          class="mb-[max(2dvh,0.75rem)] flex w-full justify-between text-xl"
          :class="{ 'text-slate-300': !isEditable }"
        >
          <div>1</div>
          <div>{{ menuPorps.maxCellNumber }}</div>
        </div>
        <!-- </div> -->
      </div>
      <!-- 右のボタン -->
      <div class="mx-4 flex justify-center">
        <button
          class="my-auto rounded-md bg-slate-100 fill-current"
          :class="{
            'hover:bg-gray-300':
              // 入力可能 かつ 数字が最大値より小さい
              isEditable && selectedNumber < menuPorps.maxCellNumber,
            'cursor-default text-slate-300':
              !isEditable || selectedNumber == menuPorps.maxCellNumber,
          }"
          @click="
            if (isEditable && selectedNumber < menuPorps.maxCellNumber) {
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
          isEditable,
        'cursor-default bg-slate-100 text-slate-300 ': !isEditable,
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
  interface Props {
    /**
     *  選択されているセルの座標
     */
    selectedCell: number[];

    /**
     * 選択されているセルに保存されている数値
     */
    selectedCellNumber: number | null;

    /**
     * 周囲8マスのうち，最大の数値
     */
    maxCellNumber: number;

    /**
     * スライダーを用いて入力できるかどうか(セルが選択されているかどうか)
     */
    isEditable: boolean;
  }

  /**
   * boardMainから受け取るデータ
   */
  const menuPorps = defineProps<Props>();

  interface Emits {
    (event: "submitButtonOnClickEmits", submittedNumber: number): void;
  }
  const submitButtonOnClickEmits = defineEmits<Emits>();

  /**
   * スライダーでユーザーが選んだ数値
   */
  const selectedNumber = ref(1);

  function clickSubmitButton() {
    if (!menuPorps.isEditable) {
      return;
    }
    submitButtonOnClickEmits("submitButtonOnClickEmits", selectedNumber.value);
  }

  watch(
    () => menuPorps.maxCellNumber,
    () => {
      selectedNumber.value = 1;
    },
  );
</script>

<style lang="scss" scoped>
  .input-range {
    -webkit-appearance: none; // スタイルリセット
    appearance: none;
    cursor: pointer;
    background: rgb(163 230 53); // 背景
    height: 20px; // バーの高さ
    width: 100%; // スライダーの幅
    border: solid 3px rgb(163 230 53); // バーまわりの線
    outline: 0; // アウトラインを消して代わりにfocusのスタイルをあてる

    // 入力できないときのCSS
    &.input-range_gray {
      background: rgb(241 245 249);
      border: rgb(241 245 249);
      pointer-events: none;
      // webkit用
      &::-webkit-slider-thumb {
        background: rgb(203 213 225);
      }
    }
    // firefox用
    &::-moz-range-thumb {
      background: rgb(203 213 225);
    }

    &:focus {
      // box-shadow: 0 0 3px #78cdff;
      outline: 1px solid;
      outline-color: rgba(162, 230, 53, 0.4);
      outline-offset: 2px;
    }
    // -webkit-向けのつまみ
    &::-webkit-slider-thumb {
      -webkit-appearance: none; // デフォルトのつまみのスタイルを解除
      background: #4a7505; // 背景色
      width: 10px; // 幅
      height: 35px; // 高さ
      border-radius: 0%; // 円形に
    }
    // -moz-向けのつまみ
    &::-moz-range-thumb {
      background: #4a7505; // 背景色
      width: 10px; // 幅
      height: 35px; // 高さ
      border-radius: 0%; // 円形に
      border: none; // デフォルトの線を消す
    }
    // Firefoxで点線が周りに表示されてしまう問題の解消
    &::-moz-focus-outer {
      border: 0;
    }
    // つまみをドラッグしているときのスタイル
    &:active::-webkit-slider-thumb {
      box-shadow: 0px 5px 10px -2px rgba(0, 0, 0, 0.3);
    }
  }
</style>
