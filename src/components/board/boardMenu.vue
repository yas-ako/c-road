<template>
  <div class="flex h-[40dvh] min-h-28 items-stretch justify-between">
    <div class="flex w-full justify-between">
      <div class="mx-4 flex justify-center">
        <button
          class="my-auto rounded-md border-solid bg-slate-200 fill-current hover:bg-gray-400"
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
      <div class="grid h-full w-full grid-flow-row gap-7">
        <div class="mt-[max(4dvh,0.75rem)] text-center text-3xl">13</div>
        <input
          type="range"
          class="input-range mb-[max(5dvh,2.5rem)]"
          name="number_input"
          min="0"
          max="10"
          step="1"
        />
      </div>
      <div class="mx-4 flex justify-center">
        <button
          class="my-auto rounded-md border-solid bg-slate-200 fill-current hover:bg-gray-400"
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
    <button
      class="flex aspect-square w-16 items-stretch border-lime-400 bg-lime-400 text-lime-800 hover:bg-lime-500 active:bg-lime-600 lg:min-w-[20vw]"
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

<style lang="scss">
  .input-range {
    -webkit-appearance: none; // スタイルリセット
    appearance: none;
    cursor: pointer;
    background: rgb(163 230 53); // 背景
    height: 5px; // バーの高さ
    width: 100%; // スライダーの幅
    border: solid 3px rgb(163 230 53); // バーまわりの線
    outline: 0; /* アウトラインを消して代わりにfocusのスタイルをあてる */
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
