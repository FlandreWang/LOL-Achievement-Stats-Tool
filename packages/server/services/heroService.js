import db from '../config/db.js'
import { fetchHeroesFromTencent } from './crawlerService.js'

const CACHE_DURATION_DAYS = parseInt(process.env.CACHE_DURATION_DAYS || '30')

export async function getHeroes() {
  // 检查缓存是否有效
  const [rows] = await db.execute(
    'SELECT COUNT(*) as count FROM heroes WHERE fetched_at > DATE_SUB(NOW(), INTERVAL ? DAY)',
    [CACHE_DURATION_DAYS]
  )

  if (rows[0].count > 0) {
    // 从数据库返回
    const [heroes] = await db.execute('SELECT * FROM heroes ORDER BY CAST(hero_id AS UNSIGNED)')
    return heroes.map(formatHero)
  }

  // 缓存过期，从腾讯 API 获取
  return await refreshHeroes()
}

export async function getHeroById(heroId) {
  const [rows] = await db.execute('SELECT * FROM heroes WHERE hero_id = ?', [heroId])
  if (rows.length === 0) return null
  return formatHero(rows[0])
}

export async function refreshHeroes() {
  const heroes = await fetchHeroesFromTencent()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  // 批量插入或更新
  for (const hero of heroes) {
    await db.execute(
      `INSERT INTO heroes (hero_id, name, title, alias, avatar, roles, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), title = VALUES(title), alias = VALUES(alias), avatar = VALUES(avatar), roles = VALUES(roles), fetched_at = VALUES(fetched_at)`,
      [hero.heroId, hero.name, hero.title, hero.alias, hero.avatar, JSON.stringify(hero.roles), now]
    )
  }

  return heroes
}

export async function getCacheStatus() {
  const [rows] = await db.execute('SELECT MAX(fetched_at) as lastFetched FROM heroes')
  const [countRows] = await db.execute('SELECT COUNT(*) as count FROM heroes')
  return {
    lastFetched: rows[0].lastFetched,
    count: countRows[0].count,
    cacheDurationDays: CACHE_DURATION_DAYS,
  }
}

function formatHero(row) {
  return {
    heroId: row.hero_id,
    name: row.name,
    title: row.title,
    alias: row.alias,
    avatar: row.avatar,
    roles: typeof row.roles === 'string' ? JSON.parse(row.roles) : row.roles,
  }
}
