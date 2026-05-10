import { Router } from 'express'
import db from '../config/db.js'

const router = Router()

// 获取所有成就定义
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM achievements ORDER BY created_at DESC')
    res.json({ code: 0, data: rows })
  } catch (error) {
    console.error('获取成就列表失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 创建成就
router.post('/', async (req, res) => {
  try {
    const { id, name, description } = req.body
    await db.execute(
      'INSERT INTO achievements (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || '']
    )
    res.json({ code: 0, data: { id, name, description } })
  } catch (error) {
    console.error('创建成就失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 更新成就
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body
    await db.execute(
      'UPDATE achievements SET name = ?, description = ? WHERE id = ?',
      [name, description || '', req.params.id]
    )
    res.json({ code: 0, message: '更新成功' })
  } catch (error) {
    console.error('更新成就失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 批量导入成就（用于 localStorage 数据迁移）
router.post('/import', async (req, res) => {
  try {
    const { achievements } = req.body
    if (!Array.isArray(achievements)) {
      return res.status(400).json({ code: -1, message: 'achievements 必须是数组' })
    }
    let imported = 0
    for (const ach of achievements) {
      if (!ach.id || !ach.name) continue
      await db.execute(
        'INSERT INTO achievements (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)',
        [ach.id, ach.name, ach.description || '']
      )
      imported++
    }
    res.json({ code: 0, data: { imported } })
  } catch (error) {
    console.error('批量导入成就失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 删除成就
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM achievements WHERE id = ?', [req.params.id])
    res.json({ code: 0, message: '删除成功' })
  } catch (error) {
    console.error('删除成就失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

export default router
