export const useNotificationStore = defineStore("notification", () => {
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

  const text = ref<[string, string]>(["", ""]);
  const isVisible = ref(false);
  const key = ref(0);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let reshowTimeoutId: ReturnType<typeof setTimeout> | undefined;

  function show(id: number): void {
    const entry = notificationData[id];
    if (entry === undefined) return;
    text.value = entry;

    if (isVisible.value) {
      isVisible.value = false;
      clearTimeout(timeoutId);
      clearTimeout(reshowTimeoutId);
      reshowTimeoutId = setTimeout(() => {
        key.value++;
        isVisible.value = true;
        scheduleHide();
      }, 100);
    } else {
      clearTimeout(reshowTimeoutId);
      isVisible.value = true;
      scheduleHide();
    }
  }

  function scheduleHide(): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      isVisible.value = false;
    }, 5000);
  }

  return { text, isVisible, key, show };
});
