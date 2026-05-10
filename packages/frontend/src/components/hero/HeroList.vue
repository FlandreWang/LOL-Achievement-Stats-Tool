<template>
  <!-- 加载状态骨架屏 -->
  <div v-if="loading" class="space-y-2">
    <div v-for="i in 8" :key="i" class="bg-lol-card border border-lol-border rounded-lg overflow-hidden animate-pulse">
      <div class="flex items-center gap-3 p-3">
        <div class="w-16 h-16 rounded-lg bg-lol-border/30" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-lol-border/30 rounded w-1/3" />
          <div class="h-3 bg-lol-border/30 rounded w-1/4" />
        </div>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <EmptyState v-else-if="heroes.length === 0" icon="🔍" text="没有找到匹配的英雄" />

  <!-- 列表 -->
  <div v-else class="space-y-2">
    <HeroListCard
      v-for="hero in heroes"
      :key="hero.heroId"
      :hero="hero"
    />
  </div>
</template>

<script setup>
import HeroListCard from './HeroListCard.vue'
import EmptyState from '../common/EmptyState.vue'

defineProps({
  heroes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>
