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
  <main class="mx-4 flex-grow overflow-scroll">
    <div
      class="game-board mx-auto grid h-[160vmin] max-h-[64rem] w-[160vmin] max-w-5xl grid-cols-[repeat(15,minmax(0,1fr))] border border-gray-300"
    >
      <BoardTile
        v-for="(_, index) in 225"
        :key="index"
        class="grid-item border-[min(0.2vmin,2.048px)] border-white"
        :number="index"
      />
    </div>
  </main>
  <boardMenu />
</template>

<script setup lang="ts" scoped>
  import { useNotificationStore } from "~/stores/notification";

  const notification = useNotificationStore();
</script>

<style scoped>
  .game-board {
    background-color: #e7e7e7;
  }

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
