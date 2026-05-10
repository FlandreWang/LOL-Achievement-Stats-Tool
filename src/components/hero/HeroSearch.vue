<template>
  <div class="relative">
    <input
      :value="modelValue"
      @input="onInput"
      type="text"
      placeholder="搜索英雄（中文 / 拼音 / 英文）"
      class="w-full h-10 pl-10 pr-9 bg-lol-card border border-lol-border rounded-lg text-sm text-lol-text placeholder-lol-muted focus:outline-none focus:border-lol-primary transition-colors"
    />
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-lol-muted hover:text-lol-text transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])

let timer = null
function onInput(e) {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', e.target.value), 150)
}
</script>
