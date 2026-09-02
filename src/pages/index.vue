<template>
  <BoardMain />
</template>
<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from "vue";
  import { onBeforeRouteLeave } from "vue-router";

  import { useGameSession } from "~/composables/useGameSession";

  const gameSession = useGameSession();

  // ページ遷移を防ぐ処理
  const confirmNavigation = () => window.confirm("本当にページを離れますか？");

  // 別のページに遷移しようとしたとき
  onBeforeRouteLeave((_to, _from, next) => {
    if (confirmNavigation()) {
      next();
    } else {
      next(false);
    }
  });

  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = "";
  };

  // ページを再読み込みしようとしたとき，ページを閉じようとしたとき
  onMounted(() => {
    window.addEventListener("beforeunload", beforeUnloadHandler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    gameSession.restart();
  });
</script>
