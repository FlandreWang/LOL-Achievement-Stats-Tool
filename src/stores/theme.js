import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'lol_theme'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref('system')
  const systemDark = ref(false)

  const effectiveTheme = computed(() => {
    if (mode.value === 'system') return systemDark.value ? 'dark' : 'light'
    return mode.value
  })

  function applyTheme() {
    if (effectiveTheme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function setMode(newMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    applyTheme()
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      mode.value = saved
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = mq.matches
    mq.addEventListener('change', (e) => {
      systemDark.value = e.matches
      applyTheme()
    })

    applyTheme()
  }

  return { mode, effectiveTheme, setMode, initTheme }
})
