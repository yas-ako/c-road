<template>
  <BoardMain />
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
</script>
