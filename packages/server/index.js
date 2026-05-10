import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db, { testConnection } from './config/db.js'
import heroesRouter from './routes/heroes.js'
import achievementsRouter from './routes/achievements.js'
import recordsRouter from './routes/records.js'

dotenv.config()

const app = express()
const PORT = process.env.SERVER_PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/heroes', heroesRouter)
app.use('/api/achievements', achievementsRouter)
app.use('/api/records', recordsRouter)

// 数据导出（从 MySQL 导出全部数据）
app.get('/api/export', async (req, res) => {
  try {
    const [achievements] = await db.execute('SELECT * FROM achievements ORDER BY created_at DESC')
    const [rows] = await db.execute('SELECT * FROM records')
    const records = {}
    for (const row of rows) {
      if (!records[row.hero_id]) records[row.hero_id] = {}
      records[row.hero_id][row.achievement_id] = {
        completed: row.completed,
        completedAt: row.completed_at,
        note: row.note || '',
      }
    }
    res.json({
      code: 0,
      data: {
        achievements,
        records,
        exportedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('导出数据失败:', error)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 健康检查
app.get('/api/health', async (req, res) => {
  const dbOk = await testConnection()
  res.json({
    code: 0,
    data: {
      status: 'ok',
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  })
})

// 启动服务
async function start() {
  const dbOk = await testConnection()
  if (!dbOk) {
    console.error('无法连接数据库，请检查配置')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`后端服务已启动: http://localhost:${PORT}`)
  })
}

start()
