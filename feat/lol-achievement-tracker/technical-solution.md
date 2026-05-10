# LOL Hero Achievement Tracker - 技术方案

> **版本**：v1.0
> **创建日期**：2026-05-10

---

## 1. 技术栈选型

| 层级 | 选型 | 理由 |
|------|------|------|
| 前端框架 | **Vue 3** (Composition API) | 响应式数据绑定，组件化开发，生态成熟 |
| 构建工具 | **Vite 5** | 快速 HMR，ESM 原生支持，项目已有基础 |
| 路由 | **Vue Router 4** | SPA 多页面切换（首页/详情/成就管理/设置） |
| 状态管理 | **Pinia** | Vue 3 官方推荐，轻量，支持持久化插件 |
| UI 框架 | **Tailwind CSS 3** | 原子化 CSS，暗色主题开箱即用，体积小 |
| 图标库 | **Lucide Vue Next** | 轻量 SVG 图标，tree-shakable |
| 搜索 | **Fuse.js** + **pinyin-pro** | 模糊匹配 + 拼音支持 |
| 存储 | **localStorage** + JSON 导入/导出 | 纯前端方案，无需后端 |
| HTTP 请求 | 原生 **fetch** | 腾讯接口支持 CORS，无需 axios |

---

## 2. 项目结构

```
lolachievements/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── public/
│   └── data/
│       └── heroes.json              # 预爬取的英雄数据缓存
├── src/
│   ├── main.js                      # 入口：挂载 Vue app
│   ├── App.vue                      # 根组件：布局 + RouterView
│   ├── router/
│   │   └── index.js                 # 路由配置
│   ├── stores/
│   │   ├── hero.js                  # 英雄数据 store
│   │   ├── achievement.js           # 成就定义 store
│   │   ├── record.js                # 成就记录 store
│   │   └── theme.js                 # 主题 store（跟随系统/手动切换）
│   ├── views/
│   │   ├── Home.vue                 # 首页：英雄网格 + 搜索
│   │   ├── HeroDetail.vue           # 英雄详情：成就勾选
│   │   ├── AchievementManage.vue    # 成就管理：增删改查
│   │   └── Settings.vue             # 设置：刷新数据/导入导出
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue        # 顶部导航栏
│   │   │   └── AppLayout.vue        # 整体布局
│   │   ├── hero/
│   │   │   ├── HeroGrid.vue         # 英雄网格容器
│   │   │   ├── HeroCard.vue         # 英雄卡片（头像+名称+进度）
│   │   │   └── HeroSearch.vue       # 搜索框（支持拼音）
│   │   ├── achievement/
│   │   │   ├── AchievementForm.vue  # 新增/编辑成就表单
│   │   │   ├── AchievementItem.vue  # 单个成就项（勾选+备注）
│   │   │   └── AchievementStats.vue # 完成进度统计
│   │   └── common/
│   │       ├── ConfirmDialog.vue    # 二次确认弹窗
│   │       ├── Toast.vue            # 提示消息
│   │       └── EmptyState.vue       # 空状态占位
│   ├── utils/
│   │   ├── crawler.js               # 英雄数据爬取（fetch + 解析）
│   │   ├── storage.js               # localStorage 读写封装
│   │   ├── search.js                # Fuse.js + pinyin 搜索封装
│   │   └── export.js                # JSON 导入/导出工具
│   └── styles/
│       └── main.css                 # Tailwind 入口 + 全局样式
```

---

## 3. 核心模块设计

### 3.1 英雄数据爬取模块 (`utils/crawler.js`)

**数据源优先级**：
1. 腾讯接口：`https://game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js`
2. Riot Data Dragon 备选

**流程**：
```
fetch 腾讯接口 → 解析 JS 对象 → 提取字段 → 写入 store + localStorage
                                    ↓ 失败
                              尝试 Riot 接口 → 解析 JSON → 写入
                                    ↓ 仍失败
                              使用 localStorage 缓存 / public/data/heroes.json
```

**头像 URL 规则**：
- 腾讯：`https://game.gtimg.cn/images/lol/act/img/champion/{alias}.png`
- Riot：`https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{alias}.png`

### 3.2 存储模块 (`utils/storage.js`)

封装 `localStorage`，统一管理三个 key：

| Key | 数据 | 说明 |
|-----|------|------|
| `lol_heroes` | `Hero[]` | 英雄列表 |
| `lol_achievements` | `Achievement[]` | 成就定义 |
| `lol_records` | `RecordMap` | 成就完成记录 |

提供 `exportAll()` / `importAll()` 方法，合并导出为单个 JSON 文件。

### 3.3 搜索模块 (`utils/search.js`)

```js
// 核心搜索逻辑
import Fuse from 'fuse.js'
import { pinyin } from 'pinyin-pro'

// 为每个英雄预计算拼音字段
function buildSearchIndex(heroes) {
  return heroes.map(h => ({
    ...h,
    _pinyin: pinyin(h.name, { toneType: 'none' }),
    _pinyinInitial: pinyin(h.name, { pattern: 'first', toneType: 'none' })
  }))
}

// Fuse.js 配置
const fuseOptions = {
  keys: ['name', 'title', 'alias', '_pinyin', '_pinyinInitial'],
  threshold: 0.3,
  ignoreLocation: true
}
```

### 3.4 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 英雄网格 + 搜索 |
| `/hero/:id` | HeroDetail | 英雄详情 + 成就列表 |
| `/achievements` | AchievementManage | 成就项目管理 |
| `/settings` | Settings | 设置页 |

### 3.5 Store 设计 (Pinia)

**hero store**：
- state: `heroes[]`, `loading`, `error`
- actions: `fetchHeroes()`, `refreshHeroes()`
- getters: `getHeroById(id)`

**achievement store**：
- state: `achievements[]`
- actions: `add()`, `update()`, `remove(id)` (remove 时同步清理 records)
- 持久化：localStorage

**record store**：
- state: `records` (结构：`{ [heroId]: { [achId]: Record } }`)
- actions: `toggle(heroId, achId)`, `updateNote(heroId, achId, note)`, `cleanByAchId(achId)`
- getters: `getHeroProgress(heroId)`, `getCompletionRate(achId)`
- 持久化：localStorage

---

## 4. UI 设计规范

### 4.1 主题策略

**默认跟随系统**，用户可手动切换（亮色 / 暗色 / 跟随系统），选择持久化到 localStorage。

```js
// tailwind.config.js
export default {
  darkMode: 'class',  // 通过 <html class="dark"> 切换
  // ...
}
```

```js
// 暗色主题色（dark 模式）
colors: {
  lol: {
    primary: '#0AC8B9',    // 破败王者青
    gold: '#C8AA6E',       // 金色
    bg: '#0A1428',         // 深蓝黑背景
    card: '#1A2332',       // 卡片背景
    border: '#2A3544',     // 边框
    text: '#E8DFD1',       // 主文字
    muted: '#8B9DAF',      // 次要文字
  }
}

// 亮色主题色（light 模式，不加 dark class 时生效）
// bg → #F5F5F5, card → #FFFFFF, border → #E0E0E0, text → #1A1A1A, muted → #666666
// primary / gold 保持不变
```

**主题 Store**（`src/stores/theme.js`）：
- state: `mode`（`'system'` | `'light'` | `'dark'`）
- getters: `effectiveTheme`（解析 system → 实际 light/dark）
- actions: `setMode(mode)`、`initTheme()`（读取 localStorage，注册 `prefers-color-scheme` 监听）
- 初始化时自动应用 `<html class="dark">` 的添加/移除

### 4.2 响应式断点

| 断点 | 列数 | 适用 |
|------|------|------|
| `< 640px` | 2 列 | 手机 |
| `640-1024px` | 3-4 列 | 平板 |
| `> 1024px` | 5-6 列 | PC |

### 4.3 关键交互

- 英雄卡片 hover：微放大 + 边框高亮
- 搜索：输入即过滤，150ms 防抖
- 成就勾选：checkbox + 自动记录时间
- 删除成就：弹窗二次确认
- 导入数据：文件选择 + 格式校验 + 确认覆盖

---

## 5. 数据爬取策略

### 5.1 腾讯接口解析

接口返回的是一段 JS 赋值语句，需提取 JSON 部分：

```js
// 响应格式：var heroList = {...}
const text = await response.text()
const jsonStr = text.replace(/^var\s+heroList\s*=\s*/, '').replace(/;?\s*$/, '')
const data = JSON.parse(jsonStr)
```

### 5.2 数据映射

```js
// 腾讯字段 → 应用字段
{
  heroId: item.heroId,
  name: item.name,           // "阿狸"
  title: item.title,         // "九尾妖狐"
  alias: item.alias,         // "Ahri"
  avatar: `https://game.gtimg.cn/images/lol/act/img/champion/${item.alias}.png`
}
```

### 5.3 容错处理

- 首次加载：优先 fetch → 失败则读 `public/data/heroes.json` → 仍失败则显示错误
- 刷新按钮：手动触发 fetch，成功后更新缓存
- 网络异常：Toast 提示，使用本地缓存继续工作

---

## 6. 构建与部署

- **开发**：`npm run dev` → Vite dev server
- **构建**：`npm run build` → 静态文件输出到 `dist/`
- **部署**：纯静态，可直接打开 `index.html` 或部署到任意静态托管

---

## 7. 依赖清单

### 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `vue` | ^3.4 | 前端框架 |
| `vue-router` | ^4.3 | 路由 |
| `pinia` | ^2.1 | 状态管理 |
| `fuse.js` | ^7.0 | 模糊搜索 |
| `pinyin-pro` | ^3.20 | 拼音转换 |
| `lucide-vue-next` | ^0.400 | 图标库 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `vite` | ^5.1 | 构建工具 (已有) |
| `@vitejs/plugin-vue` | ^5.0 | Vue SFC 支持 |
| `tailwindcss` | ^3.4 | CSS 框架 |
| `postcss` | ^8.4 | PostCSS |
| `autoprefixer` | ^10.4 | 浏览器前缀 |
| `prettier` | ^3.3 | 代码格式化 (已有) |

---

**文档结束**
