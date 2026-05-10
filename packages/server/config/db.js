import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lolachievements',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    connection.release()
    console.log('MySQL 连接成功')
    return true
  } catch (error) {
    console.error('MySQL 连接失败:', error.message)
    return false
  }
}

export default pool
