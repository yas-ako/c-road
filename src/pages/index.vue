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
  // import { onMounted, onBeforeUnmount } from "vue";
  // import { onBeforeRouteLeave } from "vue-router";

  const confirmNavigation = () => window.confirm("本当にページを離れますか？");

  onBeforeRouteLeave((to, from, next) => {
    if (confirmNavigation()) {
      next();
    } else {
      next(false);
    }
  });

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

  // import { ref } from "vue";

  const isNotificationVisible = ref(false);

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
