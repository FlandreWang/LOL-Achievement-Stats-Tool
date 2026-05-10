<template>
  <div>
    <!-- 无成就空状态 -->
    <EmptyState
      v-if="achievements.length === 0"
      icon="📋"
      text="暂无成就定义，请先前往成就管理创建"
    />

    <template v-else>
      <!-- 成就选择器 -->
      <div class="mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <div class="flex gap-2 min-w-max">
          <button
            v-for="ach in achievements"
            :key="ach.id"
            class="px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap"
            :class="selectedAchId === ach.id
              ? 'bg-lol-primary text-white border-lol-primary'
              : 'bg-lol-card text-lol-muted border-lol-border hover:border-lol-primary hover:text-lol-text'"
            @click="selectedAchId = ach.id"
          >
            {{ ach.name }}
          </button>
        </div>
      </div>

      <!-- 酷炫进度展示 -->
      <AchievementProgress
        class="mb-4"
        :completed="achProgress.completed"
        :total="achProgress.total"
        :achievement-name="selectedAchName"
        :description="selectedAchDesc"
      />

      <!-- 搜索框 + 多选 + 排序 + 布局切换 -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1">
          <HeroSearch v-model="keyword" />
        </div>
        <!-- 多选按钮 -->
        <button
          class="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg border transition-colors"
          :class="isMultiSelect
            ? 'bg-lol-primary text-white border-lol-primary'
            : 'bg-lol-card text-lol-muted border-lol-border hover:text-lol-text hover:border-lol-primary'"
          @click="isMultiSelect ? exitMultiSelect() : (isMultiSelect = true)"
        >
          <CheckSquare class="w-4 h-4" />
          <span>{{ isMultiSelect ? '取消' : '多选' }}</span>
        </button>
        <!-- 排序下拉 -->
        <div class="relative" ref="sortDropdownRef">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-lol-card border border-lol-border rounded-lg text-lol-muted hover:text-lol-text hover:border-lol-primary transition-colors"
            @click="sortOpen = !sortOpen"
          >
            <ArrowUpDown class="w-4 h-4" />
            <span>{{ currentSortLabel }}</span>
            <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': sortOpen }" />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="sortOpen"
              class="absolute right-0 mt-1 w-40 bg-lol-card border border-lol-border rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div class="py-1">
                <button
                  v-for="opt in achSortOptions"
                  :key="opt.value"
                  class="w-full px-3 py-2 text-sm text-left hover:bg-lol-primary/10 transition-colors flex items-center gap-2"
                  :class="achSort === opt.value ? 'text-lol-primary' : 'text-lol-text'"
                  @click="achSort = opt.value; sortOpen = false"
                >
                  <Check v-if="achSort === opt.value" class="w-4 h-4 shrink-0" />
                  <span v-else class="w-4 h-4 shrink-0" />
                  <span>{{ opt.label }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
        <div class="flex items-center gap-1 bg-lol-card border border-lol-border rounded-lg p-1">
          <button
            class="p-1.5 rounded transition-colors"
            :class="achLayout === 'grid' ? 'bg-lol-primary text-white' : 'text-lol-muted hover:text-lol-text'"
            @click="achLayout = 'grid'"
          >
            <Grid3X3 class="w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded transition-colors"
            :class="achLayout === 'list' ? 'bg-lol-primary text-white' : 'text-lol-muted hover:text-lol-text'"
            @click="achLayout = 'list'"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 全选/取消全选 -->
      <div v-if="isMultiSelect && filteredHeroes.length > 0" class="flex items-center gap-2 mb-3">
        <button
          class="text-xs px-2.5 py-1 rounded border border-lol-border text-lol-muted hover:text-lol-text hover:border-lol-primary transition-colors"
          @click="allSelected ? deselectAll() : selectAll()"
        >
          {{ allSelected ? '取消全选' : '全选' }}
        </button>
        <span v-if="someSelected" class="text-xs text-lol-muted">
          已选 {{ selectedHeroes.size }} 个
        </span>
      </div>

      <!-- 英雄网格/列表 -->
      <EmptyState v-if="filteredHeroes.length === 0" icon="🔍" text="没有找到匹配的英雄" />

      <template v-else>
        <div v-if="achLayout === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AchievementHeroCard
            v-for="item in filteredHeroes"
            :key="item.hero.heroId"
            :hero="item.hero"
            :completed="item.completed"
            :completed-at="item.completedAt"
            :selectable="isMultiSelect"
            :selected="selectedHeroes.has(item.hero.heroId)"
            @toggle-select="toggleSelect(item.hero.heroId)"
          />
        </div>
        <div v-else class="space-y-1.5">
          <HeroListCard
            v-for="item in filteredHeroes"
            :key="item.hero.heroId"
            :hero="item.hero"
            :completed="item.completed"
            :completed-at="item.completedAt"
            :achievement-id="selectedAchId"
            :selectable="isMultiSelect"
            :selected="selectedHeroes.has(item.hero.heroId)"
            @toggle-select="toggleSelect(item.hero.heroId)"
            compact
          />
        </div>
      </template>

      <!-- 批量操作栏 -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-4 opacity-0"
      >
        <div
          v-if="isMultiSelect && selectedHeroes.size > 0"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-lol-card border border-lol-border rounded-xl shadow-2xl z-50"
        >
          <span class="text-sm text-lol-muted">已选 {{ selectedHeroes.size }} 个</span>
          <button
            class="px-3 py-1.5 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            :disabled="batchLoading"
            @click="batchComplete"
          >
            {{ batchLoading ? '处理中...' : '批量完成' }}
          </button>
          <button
            class="px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            :disabled="batchLoading"
            @click="batchIncomplete"
          >
            {{ batchLoading ? '处理中...' : '批量未完成' }}
          </button>
          <button
            class="p-1.5 rounded-lg text-lol-muted hover:text-lol-text hover:bg-lol-border/30 transition-colors"
            @click="exitMultiSelect"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Grid3X3, List, ArrowUpDown, ChevronDown, Check, CheckSquare, Square, X } from 'lucide-vue-next'
import { pinyin } from 'pinyin-pro'
import { useAchievementStore } from '../../stores/achievement'
import { useRecordStore } from '../../stores/record'
import { useHeroStore } from '../../stores/hero'
import { createSearchEngine } from '../../utils/search'
import { useLayoutPreference } from '../../composables/useLayoutPreference'
import AchievementProgress from './AchievementProgress.vue'
import AchievementHeroCard from './AchievementHeroCard.vue'
import HeroListCard from '../hero/HeroListCard.vue'
import HeroSearch from '../hero/HeroSearch.vue'
import EmptyState from '../common/EmptyState.vue'

const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const heroStore = useHeroStore()

const selectedAchId = ref('')
const keyword = ref('')
const achLayout = useLayoutPreference('lol_achievement_layout', 'list')
const achSort = useLayoutPreference('lol_achievement_sort', 'incomplete-first')
const sortOpen = ref(false)
const isMultiSelect = ref(false)
const selectedHeroes = ref(new Set())
const batchLoading = ref(false)
let searchEngine = null

// 排序选项
const achSortOptions = [
  { value: 'incomplete-first', label: '未完成优先' },
  { value: 'completed-first', label: '已完成优先' },
  { value: 'pinyin-asc', label: '中文名 A→Z' },
  { value: 'pinyin-desc', label: '中文名 Z→A' },
  { value: 'alias-asc', label: '英文名 A→Z' },
  { value: 'alias-desc', label: '英文名 Z→A' },
  { value: 'name-asc', label: '称号 A→Z' },
  { value: 'name-desc', label: '称号 Z→A' },
]

const currentSortLabel = computed(() => {
  const opt = achSortOptions.find(o => o.value === achSort.value)
  return opt ? opt.label : '排序'
})

// 拼音缓存
const pinyinCache = new Map()
function getPinyin(text) {
  if (!pinyinCache.has(text)) {
    pinyinCache.set(text, pinyin(text, { toneType: 'none' }).toLowerCase())
  }
  return pinyinCache.get(text)
}

const achievements = computed(() => achievementStore.achievements)

// 选中成就名称
const selectedAchName = computed(() => {
  const ach = achievements.value.find(a => a.id === selectedAchId.value)
  return ach ? ach.name : ''
})

// 选中成就描述
const selectedAchDesc = computed(() => {
  const ach = achievements.value.find(a => a.id === selectedAchId.value)
  return ach ? ach.description || '' : ''
})

// 默认选中第一个成就
watch(achievements, (achs) => {
  if (achs.length > 0 && !achs.find(a => a.id === selectedAchId.value)) {
    selectedAchId.value = achs[0].id
  }
  if (achs.length === 0) {
    selectedAchId.value = ''
  }
}, { immediate: true })

// 切换成就时清除多选状态
watch(selectedAchId, () => {
  if (isMultiSelect.value) exitMultiSelect()
})

// 构建搜索引擎
watch(() => heroStore.heroes, (heroes) => {
  if (heroes.length > 0) {
    searchEngine = createSearchEngine(heroes)
  }
}, { immediate: true })

// 英雄完成状态列表（带排序）
const heroStatusList = computed(() => {
  if (!selectedAchId.value || heroStore.heroes.length === 0) return []
  const achId = selectedAchId.value
  const list = heroStore.heroes.map(hero => {
    const record = recordStore.getRecord(hero.heroId, achId)
    return {
      hero,
      completed: record.completed,
      completedAt: record.completedAt || '',
    }
  })

  switch (achSort.value) {
    case 'completed-first':
      return list.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1))
    case 'incomplete-first':
      return list.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
    case 'pinyin-asc':
      return list.sort((a, b) => getPinyin(a.hero.title).localeCompare(getPinyin(b.hero.title)))
    case 'pinyin-desc':
      return list.sort((a, b) => getPinyin(b.hero.title).localeCompare(getPinyin(a.hero.title)))
    case 'alias-asc':
      return list.sort((a, b) => a.hero.alias.localeCompare(b.hero.alias))
    case 'alias-desc':
      return list.sort((a, b) => b.hero.alias.localeCompare(a.hero.alias))
    case 'name-asc':
      return list.sort((a, b) => a.hero.name.localeCompare(b.hero.name))
    case 'name-desc':
      return list.sort((a, b) => b.hero.name.localeCompare(a.hero.name))
    default:
      return list
  }
})

// 搜索过滤
const filteredHeroes = computed(() => {
  if (!keyword.value.trim()) return heroStatusList.value
  if (!searchEngine) return heroStatusList.value
  const results = searchEngine.search(keyword.value).map(r => r.item.heroId)
  const resultSet = new Set(results)
  return heroStatusList.value.filter(item => resultSet.has(item.hero.heroId))
})

// 排序下拉点击外部关闭
const sortDropdownRef = ref(null)
function handleSortOutside(e) {
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(e.target)) {
    sortOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', handleSortOutside))
onUnmounted(() => document.removeEventListener('click', handleSortOutside))

// 多选逻辑
const visibleHeroIds = computed(() => filteredHeroes.value.map(h => h.hero.heroId))
const allSelected = computed(() => visibleHeroIds.value.length > 0 && visibleHeroIds.value.every(id => selectedHeroes.value.has(id)))
const someSelected = computed(() => selectedHeroes.value.size > 0)

function toggleSelect(heroId) {
  const s = new Set(selectedHeroes.value)
  if (s.has(heroId)) s.delete(heroId)
  else s.add(heroId)
  selectedHeroes.value = s
}

function selectAll() {
  selectedHeroes.value = new Set(visibleHeroIds.value)
}

function deselectAll() {
  selectedHeroes.value = new Set()
}

function exitMultiSelect() {
  isMultiSelect.value = false
  selectedHeroes.value = new Set()
}

async function batchComplete() {
  if (!selectedAchId.value || selectedHeroes.value.size === 0) return
  batchLoading.value = true
  try {
    const ids = [...selectedHeroes.value]
    // 只操作未完成的
    const toToggle = ids.filter(id => !recordStore.getRecord(id, selectedAchId.value).completed)
    if (toToggle.length > 0) await recordStore.batchToggle(toToggle, selectedAchId.value)
  } finally {
    batchLoading.value = false
    exitMultiSelect()
  }
}

async function batchIncomplete() {
  if (!selectedAchId.value || selectedHeroes.value.size === 0) return
  batchLoading.value = true
  try {
    const ids = [...selectedHeroes.value]
    // 只操作已完成的
    const toToggle = ids.filter(id => recordStore.getRecord(id, selectedAchId.value).completed)
    if (toToggle.length > 0) await recordStore.batchToggle(toToggle, selectedAchId.value)
  } finally {
    batchLoading.value = false
    exitMultiSelect()
  }
}

// 成就进度
const achProgress = computed(() => {
  if (!selectedAchId.value) return { completed: 0, total: 0 }
  const heroIds = heroStore.heroes.map(h => h.heroId)
  return recordStore.getAchProgress(selectedAchId.value, heroIds)
})

onMounted(() => heroStore.fetchHeroes())
</script>
