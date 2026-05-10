<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-lg font-medium text-lol-text">成就管理</h1>
      <button
        @click="$refs.form.open()"
        class="px-3 py-1.5 text-sm rounded bg-lol-primary/20 text-lol-primary hover:bg-lol-primary/30 transition-colors"
      >
        + 新增成就
      </button>
    </div>

    <EmptyState v-if="achievementStore.achievements.length === 0" icon="🏆" text="还没有自定义成就，点击上方按钮添加" />

    <div v-else class="space-y-2">
      <div
        v-for="ach in achievementStore.achievements"
        :key="ach.id"
        class="flex items-start gap-3 p-3 bg-lol-card border border-lol-border rounded-lg group"
      >
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-lol-text">{{ ach.name }}</div>
          <div v-if="ach.description" class="text-xs text-lol-muted mt-0.5">{{ ach.description }}</div>
          <div class="text-[10px] text-lol-muted mt-1">{{ formatDate(ach.createdAt) }}</div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="$refs.form.open(ach)" class="p-1 text-lol-muted hover:text-lol-primary transition-colors" title="编辑">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button @click="confirmDelete(ach)" class="p-1 text-lol-muted hover:text-red-400 transition-colors" title="删除">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <AchievementForm ref="form" @submit="onSubmit" />
    <ConfirmDialog ref="deleteDialog" title="删除成就" message="确定要删除这个成就吗？所有英雄上该成就的记录也会被清除。" @confirm="doDelete" />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAchievementStore } from '../stores/achievement'
import AchievementForm from '../components/achievement/AchievementForm.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import Toast from '../components/common/Toast.vue'
import EmptyState from '../components/common/EmptyState.vue'

const achievementStore = useAchievementStore()
const deleteDialog = ref(null)
const toast = ref(null)
let pendingDelete = null

function onSubmit({ id, name, description }) {
  if (id) {
    achievementStore.update(id, { name, description })
    toast.value?.show('成就已更新', 'success')
  } else {
    achievementStore.add({ name, description })
    toast.value?.show('成就已添加', 'success')
  }
}

function confirmDelete(ach) {
  pendingDelete = ach
  deleteDialog.value?.open()
}

function doDelete() {
  if (pendingDelete) {
    achievementStore.remove(pendingDelete.id)
    toast.value?.show('成就已删除', 'success')
    pendingDelete = null
  }
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>
