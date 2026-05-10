import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recordApi } from '../services/api'

export const useRecordStore = defineStore('record', () => {
  // records: { [heroId]: { [achId]: { completed, completedAt, note } } }
  const records = ref({})

  async function fetchAll() {
    try {
      const rows = await recordApi.getAll()
      // 转换为嵌套结构
      const map = {}
      for (const row of rows) {
        if (!map[row.hero_id]) map[row.hero_id] = {}
        map[row.hero_id][row.achievement_id] = {
          completed: row.completed,
          completedAt: row.completed_at,
          note: row.note || '',
        }
      }
      records.value = map
    } catch (e) {
      console.error('获取记录失败:', e)
    }
  }

  function ensureHero(heroId) {
    if (!records.value[heroId]) records.value[heroId] = {}
  }

  async function toggle(heroId, achId) {
    await recordApi.toggle(heroId, achId)
    ensureHero(heroId)
    const rec = records.value[heroId][achId]
    if (rec && rec.completed) {
      records.value[heroId][achId] = { completed: false }
    } else {
      records.value[heroId][achId] = { completed: true, completedAt: new Date().toISOString(), note: '' }
    }
  }

  async function updateNote(heroId, achId, note) {
    await recordApi.updateNote(heroId, achId, note)
    ensureHero(heroId)
    if (records.value[heroId][achId]) {
      records.value[heroId][achId].note = note
    }
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

  return { records, fetchAll, toggle, updateNote, getRecord, getHeroProgress, getAchProgress }
})
