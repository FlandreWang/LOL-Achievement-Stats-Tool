import { ref, onMounted, watch } from 'vue'

export function useLayoutPreference(key, defaultValue = 'grid') {
  const layout = ref(defaultValue)

  onMounted(() => {
    const saved = localStorage.getItem(key)
    if (saved === 'grid' || saved === 'list') {
      layout.value = saved
    }
  })

  watch(layout, (val) => {
    localStorage.setItem(key, val)
  })

  return layout
}
