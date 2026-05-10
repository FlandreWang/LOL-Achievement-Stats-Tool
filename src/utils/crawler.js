const TENCENT_URL = 'https://game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js'

function mapHero(h) {
  return {
    heroId: h.heroId,
    name: h.name,
    title: h.title,
    alias: h.alias,
    avatar: `https://game.gtimg.cn/images/lol/act/img/champion/${h.alias}.png`,
    roles: h.roles || [],
  }
}

export async function fetchHeroes() {
  const res = await fetch(TENCENT_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!data.hero || !Array.isArray(data.hero)) throw new Error('Invalid response format')
  return data.hero.map(mapHero)
}

export async function fetchHeroesWithFallback() {
  try {
    return await fetchHeroes()
  } catch (e) {
    console.warn('Tencent API failed, trying static cache:', e.message)
    try {
      const res = await fetch('/data/heroes.json')
      if (!res.ok) throw new Error('Static cache not found')
      return await res.json()
    } catch (e2) {
      console.error('All hero data sources failed:', e2.message)
      throw new Error('无法获取英雄数据，请检查网络连接')
    }
  }
}
