<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-lol-card border border-lol-border rounded-lg text-lol-muted hover:text-lol-text hover:border-lol-primary transition-colors"
      @click="isOpen = !isOpen"
    >
      <ArrowUpDown class="w-4 h-4" />
      <span>{{ currentLabel }}</span>
      <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': isOpen }" />
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
        v-if="isOpen"
        class="absolute right-0 mt-1 w-48 bg-lol-card border border-lol-border rounded-lg shadow-lg overflow-hidden z-50"
      >
        <div class="py-1">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="w-full px-3 py-2 text-sm text-left hover:bg-lol-primary/10 transition-colors flex items-center gap-2"
            :class="modelValue === option.value ? 'text-lol-primary' : 'text-lol-text'"
            @click="selectOption(option.value)"
          >
            <Check v-if="modelValue === option.value" class="w-4 h-4 shrink-0" />
            <span v-else class="w-4 h-4 shrink-0" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowUpDown, ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'alias-asc', label: '英文名 A→Z' },
  { value: 'alias-desc', label: '英文名 Z→A' },
  { value: 'pinyin-asc', label: '拼音名 A→Z' },
  { value: 'pinyin-desc', label: '拼音名 Z→A' },
  { value: 'achievements-desc', label: '成就多→少' },
  { value: 'achievements-asc', label: '成就少→多' },
]

const currentLabel = computed(() => {
  const option = sortOptions.find(o => o.value === props.modelValue)
  return option ? option.label : '排序'
})

function selectOption(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
