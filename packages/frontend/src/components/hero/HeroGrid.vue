<template>
  <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    <div v-for="i in 24" :key="i" class="bg-lol-card border border-lol-border rounded-lg overflow-hidden animate-pulse">
      <div class="aspect-square bg-lol-border/30" />
      <div class="p-2 space-y-1.5">
        <div class="h-3 bg-lol-border/30 rounded w-3/4" />
        <div class="h-2.5 bg-lol-border/30 rounded w-1/2" />
      </div>
    </div>
  </div>

  <EmptyState v-else-if="heroes.length === 0" icon="🔍" text="没有找到匹配的英雄" />

  <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    <HeroCard v-for="hero in heroes" :key="hero.heroId" :hero="hero" />
  </div>
</template>

<script setup>
import HeroCard from './HeroCard.vue'
import EmptyState from '../common/EmptyState.vue'

defineProps({
  heroes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>
