<template>
  <div class="relative group">
    <!-- 多选复选框 -->
    <button
      v-if="selectable"
      class="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
      :class="selected
        ? 'bg-lol-primary border-lol-primary text-white'
        : 'bg-lol-card/80 border-lol-border text-transparent hover:border-lol-primary'"
      @click.stop="$emit('toggle-select')"
    >
      <svg v-if="selected" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </button>
    <RouterLink
      :to="`/hero/${hero.heroId}`"
      class="block bg-lol-card border border-lol-border rounded-lg overflow-hidden hover:border-lol-primary hover:scale-[1.03] transition-all duration-200"
      :class="{ 'opacity-60': !completed, 'ring-2 ring-lol-primary': selected }"
    >
      <div class="relative aspect-square overflow-hidden bg-lol-border/30">
        <img
          :src="hero.avatar"
          :alt="hero.name"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          @error="onImgError"
        />
        <div
          v-if="completed"
          class="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div class="p-2">
        <div class="text-sm font-medium text-lol-text truncate">{{ hero.name }}</div>
        <div class="text-xs text-lol-muted truncate">{{ hero.title }}</div>
        <div v-if="completedAt" class="text-[10px] text-lol-muted mt-0.5 truncate">
          {{ formatDate(completedAt) }}
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup>
const props = defineProps({
  hero: { type: Object, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: String, default: '' },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

defineEmits(['toggle-select'])

function onImgError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%231A2332" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%238B9DAF" font-size="14">?</text></svg>'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>
