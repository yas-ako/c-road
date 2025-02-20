<template>
  <transition name="slide-fade">
    <div v-if="isNotificationVisible" class="notification">
      <p class="heading">見出し</p>
      <p>これは通知です</p>
    </div>
  </transition>
  <BoardMain />
  <button @click="showNotification">通知を表示</button>
</template>

<script setup>
  // ページ遷移を防ぐ処理
  const confirmNavigation = () => window.confirm("本当にページを離れますか？");

  // 別のページに遷移しようとしたとき
  onBeforeRouteLeave((to, from, next) => {
    if (confirmNavigation()) {
      next();
    } else {
      next(false);
    }
  });

  // ページを再読み込みしようとしたとき，ページを閉じようとしたとき
  onMounted(() => {
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);

    onBeforeUnmount(() => {
      window.removeEventListener("beforeunload", handler);
    });
  });

  // 通知の実装
  /**
   * 通知が表示されているかどうか
   */
  const isNotificationVisible = ref(false);

  /**
   * 通知を表示
   */
  const showNotification = () => {
    isNotificationVisible.value = true;
    // setTimeout(() => {
    //   isNotificationVisible.value = false;
    // }, 5000); // 5秒後に消える
  };
</script>

<style scoped>
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
