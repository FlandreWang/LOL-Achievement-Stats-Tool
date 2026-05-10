const API_BASE = 'http://localhost:3001/api'

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败')
  }
  return data.data
}

// 英雄数据 API
export const heroApi = {
  getAll: () => request('/heroes'),
  getById: (id) => request(`/heroes/${id}`),
  refresh: () => request('/heroes/refresh', { method: 'POST' }),
  getStatus: () => request('/heroes/status'),
}

// 成就定义 API
export const achievementApi = {
  getAll: () => request('/achievements'),
  create: (data) => request('/achievements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/achievements/${id}`, { method: 'DELETE' }),
  import: (achievements) => request('/achievements/import', { method: 'POST', body: JSON.stringify({ achievements }) }),
}

// 成就记录 API
export const recordApi = {
  getAll: () => request('/records'),
  getByHeroId: (heroId) => request(`/records/${heroId}`),
  toggle: (heroId, achievementId) => request('/records/toggle', { method: 'POST', body: JSON.stringify({ heroId, achievementId }) }),
  updateNote: (heroId, achievementId, note) => request('/records/note', { method: 'PUT', body: JSON.stringify({ heroId, achievementId, note }) }),
  import: (records) => request('/records/import', { method: 'POST', body: JSON.stringify({ records }) }),
}

// 数据导出 API
export const dataApi = {
  export: () => request('/export'),
}
