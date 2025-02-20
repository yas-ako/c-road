<template>
  <BoardMain />
</template>

<script setup>
  import { onMounted, onBeforeUnmount } from "vue";
  import { onBeforeRouteLeave } from "vue-router";

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
</script>
