<template>
  <div class="flex items-center gap-3">
    <div class="flex-1 h-2 bg-lol-border rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="completed === total && total > 0 ? 'bg-lol-gold' : 'bg-lol-primary'"
        :style="{ width: percent + '%' }"
      />
    </div>
    <span class="text-sm text-lol-muted tabular-nums shrink-0">
      {{ completed }} / {{ total }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completed: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

const percent = computed(() => props.total === 0 ? 0 : (props.completed / props.total) * 100)
</script>
