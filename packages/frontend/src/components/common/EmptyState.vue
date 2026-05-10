<template>
  <div class="flex flex-col items-center justify-center py-16 text-lol-muted">
    <div class="text-4xl mb-3">{{ icon }}</div>
    <p class="text-sm">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  text: { type: String, default: '暂无数据' },
})
</script>
