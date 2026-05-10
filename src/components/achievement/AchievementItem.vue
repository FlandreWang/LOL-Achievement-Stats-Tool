<template>
  <div class="p-3 bg-lol-card border border-lol-border rounded-lg">
    <div class="flex items-start gap-3">
      <button
        @click="$emit('toggle')"
        class="mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
        :class="record.completed ? 'bg-lol-primary border-lol-primary' : 'border-lol-border hover:border-lol-muted'"
      >
        <svg v-if="record.completed" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium" :class="record.completed ? 'text-lol-text' : 'text-lol-muted'">{{ achievement.name }}</span>
          <span v-if="record.completed && record.completedAt" class="text-[10px] text-lol-muted">
            {{ formatDate(record.completedAt) }}
          </span>
        </div>
        <div v-if="achievement.description" class="text-xs text-lol-muted mt-0.5">{{ achievement.description }}</div>

        <div v-if="record.completed" class="mt-2">
          <div v-if="showNote" class="flex items-center gap-2">
            <input
              :value="record.note || ''"
              @input="$emit('updateNote', $event.target.value)"
              type="text"
              placeholder="添加备注..."
              maxlength="50"
              class="flex-1 h-7 px-2 bg-lol-bg border border-lol-border rounded text-xs text-lol-text placeholder-lol-muted focus:outline-none focus:border-lol-primary"
            />
          </div>
          <button v-else @click="showNote = true" class="text-[10px] text-lol-muted hover:text-lol-primary transition-colors">
            {{ record.note ? '📝 ' + record.note : '+ 添加备注' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  achievement: { type: Object, required: true },
  record: { type: Object, default: () => ({ completed: false }) },
})
defineEmits(['toggle', 'updateNote'])

const showNote = ref(false)

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>
