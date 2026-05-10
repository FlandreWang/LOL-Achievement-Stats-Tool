const KEYS = {
  HEROES: 'lol_heroes',
  ACHIEVEMENTS: 'lol_achievements',
  RECORDS: 'lol_records',
  THEME: 'lol_theme',
}

function get(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function remove(key) {
  localStorage.removeItem(key)
}

function exportAll() {
  return {
    heroes: get(KEYS.HEROES) || [],
    achievements: get(KEYS.ACHIEVEMENTS) || [],
    records: get(KEYS.RECORDS) || {},
    exportedAt: new Date().toISOString(),
  }
}

function importAll(data) {
  if (data.heroes) set(KEYS.HEROES, data.heroes)
  if (data.achievements) set(KEYS.ACHIEVEMENTS, data.achievements)
  if (data.records) set(KEYS.RECORDS, data.records)
}

export { KEYS, get, set, remove, exportAll, importAll }
