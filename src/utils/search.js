import Fuse from 'fuse.js'
import { pinyin } from 'pinyin-pro'

function buildSearchIndex(heroes) {
  return heroes.map(h => ({
    ...h,
    _pinyin: pinyin(h.name, { toneType: 'none', type: 'array' }).join(''),
    _pinyinInitial: pinyin(h.name, { pattern: 'first', toneType: 'none', type: 'array' }).join(''),
  }))
}

export function createSearchEngine(heroes) {
  const indexed = buildSearchIndex(heroes)
  return new Fuse(indexed, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'title', weight: 0.2 },
      { name: 'alias', weight: 0.2 },
      { name: '_pinyin', weight: 0.15 },
      { name: '_pinyinInitial', weight: 0.05 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  })
}
