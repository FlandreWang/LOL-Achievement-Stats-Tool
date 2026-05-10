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

export async function fetchHeroesFromTencent() {
  const res = await fetch(TENCENT_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!data.hero || !Array.isArray(data.hero)) throw new Error('Invalid response format')
  return data.hero.map(mapHero)
}
