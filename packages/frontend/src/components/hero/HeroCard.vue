<template>
  <RouterLink
    :to="`/hero/${hero.heroId}`"
    class="group block bg-lol-card border border-lol-border rounded-lg overflow-hidden hover:border-lol-primary hover:scale-[1.03] transition-all duration-200"
  >
    <div class="aspect-square overflow-hidden bg-lol-border/30">
      <img
        :src="hero.avatar"
        :alt="hero.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
        @error="onImgError"
      />
    </div>
    <div class="p-2">
      <div class="text-sm font-medium text-lol-text truncate">{{ hero.name }}</div>
      <div class="text-xs text-lol-muted truncate">{{ hero.title }}</div>
      <div v-if="total > 0" class="mt-1.5">
        <div class="flex items-center gap-1.5">
          <div class="flex-1 h-1 bg-lol-border rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="completed === total ? 'bg-lol-gold' : 'bg-lol-primary'"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <span class="text-[10px] text-lol-muted tabular-nums">{{ completed }}/{{ total }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useAchievementStore } from '../../stores/achievement'
import { useRecordStore } from '../../stores/record'

const props = defineProps({
  hero: { type: Object, required: true },
})

const achievementStore = useAchievementStore()
const recordStore = useRecordStore()

const total = computed(() => achievementStore.achievements.length)
const completed = computed(() => {
  const heroRecs = recordStore.records[props.hero.heroId] || {}
  return Object.values(heroRecs).filter(r => r.completed).length
})
const progressPercent = computed(() => total.value === 0 ? 0 : (completed.value / total.value) * 100)

function onImgError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%231A2332" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%238B9DAF" font-size="14">?</text></svg>'
}
</script>
