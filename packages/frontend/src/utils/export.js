import { achievementApi, recordApi, dataApi, heroApi } from '../services/api'
import { get, KEYS } from './storage'

// 从后端 API 导出数据为 JSON 文件
export async function exportToFile() {
  const data = await dataApi.export()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lol-achievements-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 从 JSON 文件导入数据到后端
export async function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data || typeof data !== 'object') throw new Error('无效的数据格式')
        if (!Array.isArray(data.achievements)) throw new Error('缺少 achievements 数组')

        if (data.achievements.length > 0) {
          await achievementApi.import(data.achievements)
        }
        if (data.records && Object.keys(data.records).length > 0) {
          await recordApi.import(data.records)
        }
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 检查 localStorage 中的旧数据
export function getLocalStorageInfo() {
  const achievements = get(KEYS.ACHIEVEMENTS) || []
  const records = get(KEYS.RECORDS) || {}
  let totalRecords = 0
  let completedRecords = 0
  for (const achMap of Object.values(records)) {
    for (const rec of Object.values(achMap)) {
      totalRecords++
      if (rec.completed) completedRecords++
    }
  }
  return {
    achievements: achievements.length,
    totalRecords,
    completedRecords,
    heroCount: Object.keys(records).length,
  }
}

// 将 localStorage 中的旧数据迁移到 MySQL
export async function migrateFromLocalStorage() {
  const achievements = get(KEYS.ACHIEVEMENTS) || []
  const records = get(KEYS.RECORDS) || {}

  const result = { achievements: 0, records: 0, skipped: 0, errors: [] }

  // 1. 确保英雄数据已加载（满足外键约束）
  try {
    await heroApi.getAll()
  } catch {
    result.errors.push('无法获取英雄数据，记录迁移可能失败')
  }

  // 2. 导入成就
  if (achievements.length > 0) {
    try {
      const res = await achievementApi.import(achievements)
      result.achievements = res.imported
    } catch (err) {
      result.errors.push('成就导入失败：' + err.message)
    }
  }

  // 3. 导入已完成的记录
  const completedRecords = {}
  for (const [heroId, achMap] of Object.entries(records)) {
    for (const [achId, rec] of Object.entries(achMap)) {
      if (rec.completed) {
        if (!completedRecords[heroId]) completedRecords[heroId] = {}
        completedRecords[heroId][achId] = rec
      }
    }
  }

  if (Object.keys(completedRecords).length > 0) {
    try {
      const res = await recordApi.import(completedRecords)
      result.records = res.imported
      result.skipped = res.skipped || 0
    } catch (err) {
      result.errors.push('记录导入失败：' + err.message)
    }
  }

  return result
}
