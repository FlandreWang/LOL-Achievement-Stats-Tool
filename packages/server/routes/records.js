import { Router } from 'express'
import db from '../config/db.js'

const router = Router()

// 获取所有记录
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM records')
    res.json({ code: 0, data: rows })
  } catch (error) {
    console.error('获取记录失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 获取英雄的记录
router.get('/:heroId', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM records WHERE hero_id = ?', [req.params.heroId])
    res.json({ code: 0, data: rows })
  } catch (error) {
    console.error('获取英雄记录失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 切换完成状态
router.post('/toggle', async (req, res) => {
  try {
    const { heroId, achievementId } = req.body
    const [existing] = await db.execute(
      'SELECT * FROM records WHERE hero_id = ? AND achievement_id = ?',
      [heroId, achievementId]
    )

    if (existing.length > 0) {
      const record = existing[0]
      if (record.completed) {
        await db.execute(
          'UPDATE records SET completed = FALSE, completed_at = NULL WHERE id = ?',
          [record.id]
        )
      } else {
        await db.execute(
          'UPDATE records SET completed = TRUE, completed_at = NOW() WHERE id = ?',
          [record.id]
        )
      }
    } else {
      await db.execute(
        'INSERT INTO records (hero_id, achievement_id, completed, completed_at) VALUES (?, ?, TRUE, NOW())',
        [heroId, achievementId]
      )
    }

    res.json({ code: 0, message: '状态已切换' })
  } catch (error) {
    console.error('切换状态失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 批量导入记录（用于 localStorage 数据迁移）
router.post('/import', async (req, res) => {
  try {
    const { records } = req.body
    if (!records || typeof records !== 'object') {
      return res.status(400).json({ code: -1, message: 'records 必须是对象' })
    }
    let imported = 0
    for (const [heroId, achMap] of Object.entries(records)) {
      for (const [achievementId, rec] of Object.entries(achMap)) {
        if (!rec.completed) continue
        const completedAt = rec.completedAt
          ? new Date(rec.completedAt).toISOString().slice(0, 19).replace('T', ' ')
          : new Date().toISOString().slice(0, 19).replace('T', ' ')
        await db.execute(
          `INSERT INTO records (hero_id, achievement_id, completed, completed_at, note)
           VALUES (?, ?, TRUE, ?, ?)
           ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = VALUES(completed_at), note = VALUES(note)`,
          [heroId, achievementId, completedAt, rec.note || '']
        )
        imported++
      }
    }
    res.json({ code: 0, data: { imported } })
  } catch (error) {
    console.error('批量导入记录失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 更新备注
router.put('/note', async (req, res) => {
  try {
    const { heroId, achievementId, note } = req.body
    await db.execute(
      'UPDATE records SET note = ? WHERE hero_id = ? AND achievement_id = ?',
      [note, heroId, achievementId]
    )
    res.json({ code: 0, message: '备注已更新' })
  } catch (error) {
    console.error('更新备注失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

export default router
