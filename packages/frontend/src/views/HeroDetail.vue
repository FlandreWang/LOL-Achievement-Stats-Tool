<template>
  <div v-if="!hero" class="text-center py-16 text-lol-muted">
    <p>英雄不存在</p>
    <RouterLink to="/" class="text-lol-primary text-sm mt-2 inline-block">返回首页</RouterLink>
  </div>

  <div v-else>
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/" class="text-lol-muted hover:text-lol-text transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </RouterLink>
      <img :src="hero.avatar" :alt="hero.name" class="w-12 h-12 rounded-lg object-cover" @error="onImgError" />
      <div>
        <h1 class="text-lg font-medium text-lol-text">{{ hero.name }}</h1>
        <p class="text-sm text-lol-muted">{{ hero.title }}</p>
        <p class="text-xs text-lol-muted">{{ hero.alias }}</p>
      </div>
    </div>

    <div class="mb-5">
      <AchievementStats :completed="completedCount" :total="totalCount" />
    </div>

    <EmptyState v-if="achievementStore.achievements.length === 0" icon="🏆" text="还没有自定义成就，请先去成就管理页面添加" />

    <div v-else class="space-y-2">
      <AchievementItem
        v-for="ach in achievementStore.achievements"
        :key="ach.id"
        :achievement="ach"
        :record="recordStore.getRecord(heroId, ach.id)"
        @toggle="recordStore.toggle(heroId, ach.id)"
        @updateNote="(note) => recordStore.updateNote(heroId, ach.id, note)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHeroStore } from '../stores/hero'
import { useAchievementStore } from '../stores/achievement'
import { useRecordStore } from '../stores/record'
import AchievementItem from '../components/achievement/AchievementItem.vue'
import AchievementStats from '../components/achievement/AchievementStats.vue'
import EmptyState from '../components/common/EmptyState.vue'

const route = useRoute()
const heroStore = useHeroStore()
const achievementStore = useAchievementStore()
const recordStore = useRecordStore()

const heroId = computed(() => route.params.id)
const hero = computed(() => heroStore.getHeroById(heroId.value))
const totalCount = computed(() => achievementStore.achievements.length)
const completedCount = computed(() => {
  const heroRecs = recordStore.records[heroId.value] || {}
  return Object.values(heroRecs).filter(r => r.completed).length
})

function onImgError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%231A2332" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%238B9DAF" font-size="14">?</text></svg>'
}
</script>
