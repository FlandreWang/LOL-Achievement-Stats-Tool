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
import { computed, ref } from 'vue'
import { useHeroStore } from '../stores/hero'
import { useAchievementStore } from '../stores/achievement'
import { useRecordStore } from '../stores/record'
import { useThemeStore } from '../stores/theme'
import { exportToFile, importFromFile } from '../utils/export'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import Toast from '../components/common/Toast.vue'

const heroStore = useHeroStore()
const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const themeStore = useThemeStore()
const toast = ref(null)

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

async function refreshHeroes() {
  await heroStore.refreshHeroes()
  if (!heroStore.error) toast.value?.show('英雄数据已更新', 'success')
}

function handleExport() {
  exportToFile()
  toast.value?.show('数据已导出', 'success')
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
</script>
