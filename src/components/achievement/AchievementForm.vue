<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="close">
        <div class="bg-lol-card border border-lol-border rounded-lg p-5 w-full max-w-md mx-4 shadow-xl">
          <h3 class="text-lol-text font-medium mb-4">{{ isEdit ? '编辑成就' : '新增成就' }}</h3>
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="block text-sm text-lol-muted mb-1">名称 <span class="text-red-400">*</span></label>
              <input
                ref="nameInput"
                v-model="form.name"
                type="text"
                maxlength="30"
                class="w-full h-9 px-3 bg-lol-bg border border-lol-border rounded text-sm text-lol-text focus:outline-none focus:border-lol-primary"
                placeholder="例如：五杀"
              />
            </div>
            <div class="mb-5">
              <label class="block text-sm text-lol-muted mb-1">描述</label>
              <textarea
                v-model="form.description"
                rows="2"
                maxlength="100"
                class="w-full px-3 py-2 bg-lol-bg border border-lol-border rounded text-sm text-lol-text focus:outline-none focus:border-lol-primary resize-none"
                placeholder="可选描述"
              />
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" @click="close" class="px-4 py-1.5 text-sm rounded border border-lol-border text-lol-muted hover:text-lol-text transition-colors">取消</button>
              <button type="submit" :disabled="!form.name.trim()" class="px-4 py-1.5 text-sm rounded bg-lol-primary/20 text-lol-primary hover:bg-lol-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {{ isEdit ? '保存' : '添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'

const emit = defineEmits(['submit'])
const visible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const nameInput = ref(null)
const form = reactive({ name: '', description: '' })

function open(achievement = null) {
  if (achievement) {
    isEdit.value = true
    editId.value = achievement.id
    form.name = achievement.name
    form.description = achievement.description || ''
  } else {
    isEdit.value = false
    editId.value = null
    form.name = ''
    form.description = ''
  }
  visible.value = true
  nextTick(() => nameInput.value?.focus())
}

function close() {
  visible.value = false
}

function submit() {
  if (!form.name.trim()) return
  emit('submit', { id: editId.value, name: form.name.trim(), description: form.description.trim() })
  close()
}

defineExpose({ open })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
