<template>
  <transition name="slide-fade">
    <div
      v-if="isNotificationVisible"
      :key="notificationKey"
      class="notification"
    >
      <p class="heading">
        {{ notification[0] }}
      </p>
      <p>{{ notification[1] }}</p>
    </div>
  </transition>
  <main class="mx-4 flex-grow overflow-scroll">
    <div
      class="game-board mx-auto grid h-[160vmin] max-h-[64rem] w-[160vmin] max-w-5xl grid-cols-[repeat(15,minmax(0,1fr))] border border-gray-300"
    >
      <!-- <div
        v-for="i in new Array(225)"
        :key="i"
        class="grid-item border-gray-240 border-[1px]"
      > -->
      <!-- <BoardTile /> -->
      <BoardTile
        v-for="(n, index) in 225"
        :key="index"
        class="grid-item border-[min(0.2vmin,2.048px)] border-white"
        :number="index"
        :cell-data="cellData"
        :selected-cell="selectedCell"
        :side="side"
        @click-tile-emits="clickTile"
      />
    </div>
  </main>
  <boardMenu
    :selected-cell="selectedCell"
    :selected-cell-number="selectedCellNumber"
    :max-cell-number="maxCellNumber"
    :is-editable="isEditable"
    @submit-button-on-click-emits="submitButtonOnClick"
  />
</template>

<script setup lang="ts" scoped>
  /**
   * 手番
   * 1:青，-1:赤
   */
  const side = ref<number>(1);

  /**
   * 13*13 のマス目データ 初期値は0
   */
  const cellData = ref<number[][]>(
    [...Array(13)].map((_) => Array(13).fill(0)),
  );

  /**
   * 選択されているセルに入力できる値の最大値
   */
  const maxCellNumber = ref(10);

  // for (let i = 0; i < cellData.value.length; i++) {
  //   for (let j = 0; j < cellData.value.length; j++) {
  //     cellData.value[i][j] = 13 * j + i;
  //   }
  // }

  /**
   * 選択されているセルの値
   *
   * `[-1, -1]` の時は選択されていないとき
   */
  const selectedCell = ref([-1, -1]);
  const selectedCellNumber = ref<number>(0);

  // 選択されたセルの座標が変化したとき
  // selectedCellNumber (選択されたセルの数値) を更新する
  watchEffect(() => {
    // どのセルも選択されていないとき，セルの値を1000とする
    selectedCellNumber.value =
      selectedCell.value[0] >= 0
        ? cellData.value[selectedCell.value[0]][selectedCell.value[1]]
        : 1000;
    // console.debug("selectedCellNumber.value", selectedCellNumber.value);
  });

  // /////////////////////////////////////////////////////////
  // <!-- 通知 -->
  // /////////////////////////////////////////////////////////

  // 通知する文字
  const notification = ref<[string, string]>(["", ""]);

  // 通知の実装
  const notificationData: [string, string][] = [
    [
      "ルール：上限",
      "同じ道路番号 n に挟まれている場合，新たに設置する道路番号は n 以下である必要があります",
    ],
    [
      "ルール：取り壊し",
      "道路番号ｎ-1のマスを、道路番号 n の道で挟んだとき，挟まれたマスの道は取り壊されます。",
    ],
  ];

  /**
   * 通知が表示されているかどうか
   */
  const isNotificationVisible = ref(false);

  /**
   * 異なる通知を区別するためのキー
   */
  const notificationKey = ref(0);

  /**
   * setTimeout の戻り値を保管
   * (タイムアウトをクリアできるようにする)
   */
  const timeoutId = ref<NodeJS.Timeout>(); // setTimeout の ID を保持

  /**
   * 通知を表示
   */
  const showNotification = (id: number): void => {
    if (isNotificationVisible.value) {
      // すでに表示されている場合、一度非表示にする
      isNotificationVisible.value = false;
      // 前回の setTimeout をクリア
      clearTimeout(timeoutId.value);

      // 少し遅らせて再表示（アニメーションが確実に適用されるように）
      setTimeout(() => {
        // keyを変更して強制的に再描画

        notificationKey.value++;
        isNotificationVisible.value = true;
        scheduleHideNotification(id);
      }, 100); // 100ms の小さな遅延を入れる
    } else {
      // 通知を表示
      isNotificationVisible.value = true;
      scheduleHideNotification(id);
    }
  };

  /**
   * 通知を非表示にするタイマーをスケジュールする
   * @param id 通知テキストのID
   */
  const scheduleHideNotification = (id: number): void => {
    // 以前のタイムアウトをクリア
    clearTimeout(timeoutId.value);
    notification.value = [...notificationData[id]];

    // タイムアウトのIDを記録
    timeoutId.value = setTimeout(() => {
      isNotificationVisible.value = false;
    }, 5000); // 5秒後に消える
  };

  // /////////////////////////////////////////////////////////
  // <!-- 通知おわり -->
  // /////////////////////////////////////////////////////////

  /**
   * ルール：取り壊しの処理中かどうか
   *
   * true  - 処理中  タイルをクリックできない
   * false - 処理中でない  タイルをクリックできる
   */
  const isBeingRemoved = ref(false);

  /**
   * boradTile から呼び出されるEmmits
   */
  const clickTile = (clickTileData: [number, number, number, number]): void => {
    maxCellNumber.value = clickTileData[2];
    // 取り壊しの処理中はクリックできないようにする
    if (isBeingRemoved.value) return;
    if (
      // 同じマスが二度クリックされたとき
      selectedCell.value[0] === clickTileData[0] &&
      selectedCell.value[1] === clickTileData[1]
    ) {
      // 選択解除
      selectedCell.value = [-1, -1];
    } else {
      // 直前までと異なるマスがクリックされた時，クリックされたセルの座標を代入
      [selectedCell.value[0], selectedCell.value[1]] = clickTileData;

      // notificationTypeが0のとき，通知を表示する
      if (clickTileData[3] === 0) {
        showNotification(0);
      }
    }
  };

  /**
   * セルが選択されているかどうか(数値を入力できるかどうか)
   */
  const isEditable = ref<boolean>(false);

  // 選択されているセルが変わるごとに isEditable に値を代入する
  watchEffect(() => {
    // console.debug("isEditableのためのwatchEffect");
    // console.debug("selectedCellNumber.value", selectedCellNumber.value);

    // 選択されたセルが存在する(座標が[-1, -1]でない) かつ 選択されたセルに入っている値が0である ときのみ true に
    isEditable.value =
      selectedCell.value[0] !== -1 &&
      selectedCell.value[1] !== -1 &&
      selectedCellNumber.value === 0;
  });

  /**
   * boardMenu からのEmitsがここに来る
   *
   * 入力を確定させたとき
   */
  const submitButtonOnClick = (submittedNumber: number): void => {
    // 入力されたセルに値を代入
    cellData.value[selectedCell.value[0]][selectedCell.value[1]] =
      submittedNumber * side.value;

    // 手番を交代
    side.value = side.value * -1;

    // 取り壊しの処理を開始
    isBeingRemoved.value = true;

    type Coordinate = { x: number; y: number };

    /**
     * 取り壊される座標のリスト;
     */
    const removedList: Coordinate[] = [];

    /**
     * 8方向の定義
     * ```
     * [-1, -1], [-1, 0], [-1, 1],
     * [ 0, -1],          [ 0, 1],
     * [ 1, -1], [ 1, 0], [ 1, 1]
     * ```
     */
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    // x座標
    for (let x = 0; x < 13; x++) {
      // y座標
      for (let y = 0; y < 13; y++) {
        /**
         * 着目するセルの値
         */
        const n = Math.abs(cellData.value[x][y]);

        // 値が0の場合は繰り返しをスキップする
        if (n === 0) continue;

        // 値が1の場合は繰り返しをスキップする
        if (n === 1) continue;

        for (const [dx, dy] of directions) {
          const currentChain = []; // この方向で連続する n-1 のセルを記録
          let step = 1;
          while (true) {
            // ラッピングを考慮して新しい座標を計算
            const nx = (x + dx * step + 13) % 13;
            const ny = (y + dy * step + 13) % 13;

            // 探索中に起点に戻ってきた場合
            if (nx === x && ny === y) {
              // 1マス以上連続していた場合は、取り壊し対象として記録
              if (currentChain.length > 0) {
                removedList.push(...currentChain);
              }
              break;
            }

            const currentValue = Math.abs(cellData.value[nx][ny]);

            if (step === 1) {
              // 最初のセルは必ず n-1 でなければならない
              if (currentValue !== n - 1) break;
              currentChain.push({ x: nx, y: ny });
            } else if (currentValue === n - 1) {
              // 連続する n-1 のセルを追加
              currentChain.push({ x: nx, y: ny });
            } else if (currentValue === n) {
              // チェーンが1マス以上ある場合は対象として記録
              if (currentChain.length > 0) {
                removedList.push(...currentChain);
              }
              break;
            } else {
              // 条件に合わない場合は探索終了
              break;
            }
            step++;
          }
        }
      }
    }

    // 取り壊されるマスが存在するとき
    if (removedList.length > 0) {
      // 通知を表示
      showNotification(1);
      // 「取り壊し」が起きたことをわかりやすくするため，取り壊すまでに2秒待機
      setTimeout(function () {
        // すべての探索が終わった後、一括で取り壊し（対象セルを0に更新）
        for (const coord of removedList) {
          cellData.value[coord.x][coord.y] = 0;
        }
      }, 2000);
    }
    isBeingRemoved.value = false;
  };
</script>

<style scoped>
  .game-board {
    background-color: #e7e7e7;
  }
  /* .grid-item { */
  /* background-color: #c0c0c0; */
  /* } */

  /* .grid-item:nth-child(-n + 15),
  .grid-item:nth-child(15n + 1),
  .grid-item:nth-child(15n + 15),
  .grid-item:nth-last-child(-n + 15) {
    background-color: #d6d6d6;
  } */

  /* 通知のデザイン */
  .notification {
    z-index: 15;
    position: fixed;
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
