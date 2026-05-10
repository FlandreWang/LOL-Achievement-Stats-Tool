<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="cancel">
        <div class="bg-lol-card border border-lol-border rounded-lg p-5 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lol-text font-medium mb-2">{{ title }}</h3>
          <p class="text-lol-muted text-sm mb-5">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-1.5 text-sm rounded border border-lol-border text-lol-muted hover:text-lol-text transition-colors"
              @click="cancel"
            >
              取消
            </button>
            <button
              class="px-4 py-1.5 text-sm rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              @click="confirm"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])
const visible = ref(false)

function open() { visible.value = true }
function close() { visible.value = false }
function confirm() { emit('confirm'); close() }
function cancel() { emit('cancel'); close() }

defineExpose({ open, close })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
