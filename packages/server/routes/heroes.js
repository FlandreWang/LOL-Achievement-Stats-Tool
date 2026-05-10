import { Router } from 'express'
import { getHeroes, getHeroById, refreshHeroes, getCacheStatus } from '../services/heroService.js'

const router = Router()

// 获取所有英雄
router.get('/', async (req, res) => {
  try {
    const heroes = await getHeroes()
    res.json({ code: 0, data: heroes })
  } catch (error) {
    console.error('获取英雄数据失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 获取缓存状态
router.get('/status', async (req, res) => {
  try {
    const status = await getCacheStatus()
    res.json({ code: 0, data: status })
  } catch (error) {
    console.error('获取缓存状态失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 获取单个英雄
router.get('/:id', async (req, res) => {
  try {
    const hero = await getHeroById(req.params.id)
    if (!hero) {
      return res.status(404).json({ code: -1, message: '英雄不存在' })
    }
    res.json({ code: 0, data: hero })
  } catch (error) {
    console.error('获取英雄详情失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 强制刷新英雄数据
router.post('/refresh', async (req, res) => {
  try {
    const heroes = await refreshHeroes()
    res.json({ code: 0, data: heroes, message: '数据已更新' })
  } catch (error) {
    console.error('刷新英雄数据失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

export default router
