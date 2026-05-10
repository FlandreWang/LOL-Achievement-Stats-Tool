import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/db.js'
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
