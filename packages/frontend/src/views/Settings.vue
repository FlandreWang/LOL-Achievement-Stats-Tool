<template>
  <div class="max-w-lg">
    <h1 class="text-lg font-medium text-lol-text mb-5">设置</h1>

    <div class="space-y-4">
      <section class="p-4 bg-lol-card border border-lol-border rounded-lg">
        <h2 class="text-sm font-medium text-lol-text mb-3">主题</h2>
        <div class="flex gap-2">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            @click="themeStore.setMode(opt.value)"
            class="px-3 py-1.5 text-sm rounded border transition-colors"
            :class="themeStore.mode === opt.value ? 'border-lol-primary bg-lol-primary/10 text-lol-primary' : 'border-lol-border text-lol-muted hover:text-lol-text'"
          >
            {{ opt.label }}
          </button>
        </div>
      </section>

      <section class="p-4 bg-lol-card border border-lol-border rounded-lg">
        <h2 class="text-sm font-medium text-lol-text mb-3">英雄数据</h2>
        <div v-if="heroStore.cacheStatus" class="text-xs text-lol-muted mb-3">
          <p>上次更新：{{ formatDate(heroStore.cacheStatus.lastFetched) }}</p>
          <p>缓存英雄数：{{ heroStore.cacheStatus.count }}</p>
        </div>
        <button
          @click="refreshHeroes"
          :disabled="heroStore.loading"
          class="px-4 py-2 text-sm rounded bg-lol-primary/20 text-lol-primary hover:bg-lol-primary/30 transition-colors disabled:opacity-50"
        >
          {{ heroStore.loading ? '刷新中...' : '刷新英雄数据' }}
        </button>
        <p v-if="heroStore.error" class="text-red-400 text-xs mt-2">{{ heroStore.error }}</p>
      </section>

      <section class="p-4 bg-lol-card border border-lol-border rounded-lg">
        <h2 class="text-sm font-medium text-lol-text mb-3">数据备份</h2>
        <div class="flex gap-3">
          <button @click="handleExport" class="px-4 py-2 text-sm rounded border border-lol-border text-lol-muted hover:text-lol-text transition-colors">
            导出数据
          </button>
          <label class="px-4 py-2 text-sm rounded border border-lol-border text-lol-muted hover:text-lol-text transition-colors cursor-pointer">
            导入数据
            <input type="file" accept=".json" class="hidden" @change="handleImport" />
          </label>
        </div>
        <p class="text-xs text-lol-muted mt-2">导出/导入通过后端 API 操作 MySQL 数据库</p>
      </section>

      <section class="p-4 bg-lol-card border border-lol-border rounded-lg">
        <h2 class="text-sm font-medium text-lol-text mb-3">数据迁移</h2>
        <p class="text-xs text-lol-muted mb-3">将浏览器 localStorage 中的旧数据迁移到 MySQL 数据库</p>
        <div v-if="localInfo" class="text-xs text-lol-muted mb-3 space-y-1">
          <p>localStorage 中有：{{ localInfo.achievements }} 条成就，{{ localInfo.completedRecords }} 条已完成记录（{{ localInfo.heroCount }} 个英雄）</p>
        </div>
        <button
          @click="handleMigrate"
          :disabled="migrating"
          class="px-4 py-2 text-sm rounded bg-lol-primary/20 text-lol-primary hover:bg-lol-primary/30 transition-colors disabled:opacity-50"
        >
          {{ migrating ? '迁移中...' : '从 localStorage 迁移' }}
        </button>
        <div v-if="migrateResult" class="text-xs mt-2 space-y-1">
          <p class="text-lol-muted">已迁移 {{ migrateResult.achievements }} 条成就，{{ migrateResult.records }} 条记录</p>
          <p v-if="migrateResult.skipped" class="text-yellow-400">跳过 {{ migrateResult.skipped }} 条（英雄不存在）</p>
          <p v-for="(err, i) in migrateResult.errors" :key="i" class="text-red-400">{{ err }}</p>
        </div>
      </section>

      <section class="p-4 bg-lol-card border border-lol-border rounded-lg">
        <h2 class="text-sm font-medium text-lol-text mb-3">数据统计</h2>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <div class="text-lg font-bold text-lol-primary">{{ heroStore.heroes.length }}</div>
            <div class="text-xs text-lol-muted">英雄</div>
          </div>
          <div>
            <div class="text-lg font-bold text-lol-primary">{{ achievementStore.achievements.length }}</div>
            <div class="text-xs text-lol-muted">成就</div>
          </div>
          <div>
            <div class="text-lg font-bold text-lol-primary">{{ totalRecords }}</div>
            <div class="text-xs text-lol-muted">已完成</div>
          </div>
        </div>
      </section>

      <section class="p-4 bg-lol-card border border-lol-border rounded-lg">
        <h2 class="text-sm font-medium text-lol-text mb-3">危险操作</h2>
        <button @click="$refs.clearDialog.open()" class="px-4 py-2 text-sm rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
          清空所有记录
        </button>
      </section>
    </div>

    <ConfirmDialog ref="clearDialog" title="清空所有记录" message="确定要清空所有成就完成记录吗？此操作不可撤销。" @confirm="clearRecords" />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useHeroStore } from '../stores/hero'
import { useAchievementStore } from '../stores/achievement'
import { useRecordStore } from '../stores/record'
import { useThemeStore } from '../stores/theme'
import { exportToFile, importFromFile, migrateFromLocalStorage, getLocalStorageInfo } from '../utils/export'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import Toast from '../components/common/Toast.vue'

const heroStore = useHeroStore()
const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const themeStore = useThemeStore()
const toast = ref(null)
const migrating = ref(false)
const migrateResult = ref(null)
const localInfo = ref(null)

const themeOptions = [
  { label: '跟随系统', value: 'system' },
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' },
]

const totalRecords = computed(() => {
  let count = 0
  for (const heroId of Object.keys(recordStore.records)) {
    count += Object.values(recordStore.records[heroId]).filter(r => r.completed).length
  }
  return count
})

function formatDate(dateStr) {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  heroStore.fetchCacheStatus()
  localInfo.value = getLocalStorageInfo()
})

async function refreshHeroes() {
  await heroStore.refreshHeroes()
  await heroStore.fetchCacheStatus()
  if (!heroStore.error) toast.value?.show('英雄数据已更新', 'success')
}

async function handleExport() {
  try {
    await exportToFile()
    toast.value?.show('数据已导出', 'success')
  } catch (err) {
    toast.value?.show('导出失败：' + err.message, 'error')
  }
}

async function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    await importFromFile(file)
    window.location.reload()
  } catch (err) {
    toast.value?.show('导入失败：' + err.message, 'error')
  }
  e.target.value = ''
}

function clearRecords() {
  recordStore.clearAll()
  toast.value?.show('记录已清空', 'success')
}

async function handleMigrate() {
  migrating.value = true
  migrateResult.value = null
  try {
    const result = await migrateFromLocalStorage()
    migrateResult.value = result
    toast.value?.show('数据迁移完成', 'success')
    await achievementStore.fetchAll()
    await recordStore.fetchAll()
  } catch (err) {
    toast.value?.show('迁移失败：' + err.message, 'error')
  } finally {
    migrating.value = false
  }
}
</script>
