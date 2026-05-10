import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { KEYS, get, set } from '../utils/storage'

export const useRecordStore = defineStore('record', () => {
  // records: { [heroId]: { [achId]: { completed, completedAt, note } } }
  const records = ref({})

  function load() {
    const cached = get(KEYS.RECORDS)
    if (cached) records.value = cached
  }

  function save() {
    set(KEYS.RECORDS, records.value)
  }

  function ensureHero(heroId) {
    if (!records.value[heroId]) records.value[heroId] = {}
  }

  function toggle(heroId, achId) {
    ensureHero(heroId)
    const rec = records.value[heroId][achId]
    if (rec && rec.completed) {
      records.value[heroId][achId] = { completed: false }
    } else {
      records.value[heroId][achId] = { completed: true, completedAt: new Date().toISOString(), note: '' }
    }
    save()
  }

  function updateNote(heroId, achId, note) {
    ensureHero(heroId)
    if (records.value[heroId][achId]) {
      records.value[heroId][achId].note = note
      save()
    }
  }

  function cleanByAchId(achId) {
    for (const heroId of Object.keys(records.value)) {
      delete records.value[heroId][achId]
    }
    save()
  }

  function getRecord(heroId, achId) {
    return records.value[heroId]?.[achId] || { completed: false }
  }

  function getHeroProgress(heroId, totalAch) {
    const heroRecs = records.value[heroId] || {}
    const completed = Object.values(heroRecs).filter(r => r.completed).length
    return { completed, total: totalAch }
  }

  function getAchProgress(achId, heroIds) {
    const completed = heroIds.filter(id =>
      records.value[id]?.[achId]?.completed
    ).length
    return { completed, total: heroIds.length }
  }

  function clearAll() {
    records.value = {}
    save()
  }

  load()

  return { records, toggle, updateNote, cleanByAchId, getRecord, getHeroProgress, getAchProgress, clearAll }
})
