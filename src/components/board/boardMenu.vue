<template>
  <div class="flex h-[40dvh] min-h-28 items-stretch justify-between">
    <div class="flex w-full justify-between">
      <div class="w-10">
        <button>-</button>
      </div>
      <div class="flex h-full">
        <input
          type="range"
          class="input-range my-auto justify-center"
          name="number_input"
          min="0"
          max="10"
        />
      </div>
      <button class="w-10">+</button>
    </div>
    <button
      class="flex aspect-square w-16 items-stretch border-lime-400 bg-lime-400 text-lime-800 hover:bg-lime-500 active:bg-lime-600 lg:min-w-[20vw]"
    >
      <svg
        class="m-auto justify-center fill-current"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
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
    background: #ffffff; // 背景
    height: 35px; // バーの高さ
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
      background: rgb(163 230 53); // 背景色
      width: 10px; // 幅
      height: 25px; // 高さ
      border-radius: 30%; // 円形に
    }
    // -moz-向けのつまみ
    &::-moz-range-thumb {
      background: rgb(163 230 53); // 背景色
      width: 10px; // 幅
      height: 25px; // 高さ
      border-radius: 30%; // 円形に
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
