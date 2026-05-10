import Fuse from 'fuse.js'
import { pinyin } from 'pinyin-pro'

function buildSearchIndex(heroes) {
  return heroes.map(h => {
    const pinyinSource = h.title ? `${h.name}${h.title}` : h.name
    return {
      ...h,
      _pinyin: pinyin(pinyinSource, { toneType: 'none', type: 'array' }).join(''),
      _pinyinInitial: pinyin(pinyinSource, { pattern: 'first', toneType: 'none', type: 'array' }).join(''),
    }
  })
}

export function createSearchEngine(heroes) {
  const indexed = buildSearchIndex(heroes)
  return new Fuse(indexed, {
    keys: [
      { name: 'title', weight: 0.4 },       // 中文名
      { name: 'name', weight: 0.2 },         // 称号
      { name: 'alias', weight: 0.2 },        // 英文名
      { name: '_pinyin', weight: 0.15 },     // 全拼
      { name: '_pinyinInitial', weight: 0.05 }, // 拼音首字母
    ],
    threshold: 0.35,
    ignoreLocation: true,
  })
}
