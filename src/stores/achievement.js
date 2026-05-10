import { defineStore } from 'pinia'
import { ref } from 'vue'
import { KEYS, get, set } from '../utils/storage'
import { useRecordStore } from './record'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref([])

  function load() {
    const cached = get(KEYS.ACHIEVEMENTS)
    if (cached) achievements.value = cached
  }

  function save() {
    set(KEYS.ACHIEVEMENTS, achievements.value)
  }

  function add({ name, description = '' }) {
    const id = 'ach_' + Date.now()
    achievements.value.push({ id, name, description, createdAt: new Date().toISOString() })
    save()
    return id
  }

  function update(id, data) {
    const ach = achievements.value.find(a => a.id === id)
    if (ach) {
      Object.assign(ach, data)
      save()
    }
  }

  function remove(id) {
    achievements.value = achievements.value.filter(a => a.id !== id)
    save()
    const recordStore = useRecordStore()
    recordStore.cleanByAchId(id)
  }

  load()

  return { achievements, add, update, remove }
})
