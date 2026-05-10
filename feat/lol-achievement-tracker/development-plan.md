# LOL Hero Achievement Tracker - 开发计划

> **版本**：v1.0
> **创建日期**：2026-05-10

---

## 任务总览

| 阶段 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| P0 | 项目初始化 & 基础配置 | 高 | - |
| P1 | 英雄数据爬取 & 存储 | 高 | - |
| P2 | 首页 & 英雄网格 | 高 | - |
| P3 | 搜索功能 | 高 | - |
| P4 | 成就管理 | 高 | - |
| P5 | 英雄详情 & 成就记录 | 高 | - |
| P6 | 设置页 & 数据导入导出 | 中 | - |
| P7 | 细节打磨 & 验收 | 中 | - |

---

## P0：项目初始化 & 基础配置

### T0.1 安装依赖
- 安装 Vue 3、Vue Router、Pinia、Tailwind CSS、PostCSS、Autoprefixer、@vitejs/plugin-vue
- 安装 fuse.js、pinyin-pro、lucide-vue-next
- 配置 `vite.config.js`（Vue 插件）
- 配置 `tailwind.config.js`（`darkMode: 'class'`、亮暗双主题色值）
- 配置 `postcss.config.js`
- 更新 `package.json` scripts

### T0.2 搭建项目骨架
- 创建 `src/main.js`（Vue app 入口，挂载 Router、Pinia）
- 创建 `src/App.vue`（根组件，RouterView + 全局布局）
- 创建 `src/router/index.js`（4 个路由：Home / HeroDetail / AchievementManage / Settings）
- 创建 `src/styles/main.css`（Tailwind 指令 + 亮暗双主题全局样式）
- 更新 `index.html`（标题、meta、viewport）

### T0.3 通用组件
- `src/components/common/ConfirmDialog.vue`（二次确认弹窗）
- `src/components/common/Toast.vue`（消息提示）
- `src/components/common/EmptyState.vue`（空状态占位）

### T0.4 主题 Store & 切换机制
- 创建 `src/stores/theme.js`（Pinia）
  - state: `mode`（`'system'` | `'light'` | `'dark'`，默认 `'system'`）
  - getters: `effectiveTheme`（将 system 解析为实际 light/dark）
  - actions: `setMode(mode)`、`initTheme()`
  - `initTheme()`：读取 localStorage 缓存，注册 `matchMedia('prefers-color-scheme: dark')` 的 change 监听
  - 切换时操作 `<html>` 的 `class`：dark 模式添加 `dark`，light 模式移除 `dark`
  - 持久化 mode 到 localStorage（key: `lol_theme`）
- 在 `main.js` 中调用 `themeStore.initTheme()` 确保首屏无闪烁

**提交**：`feat?: initialize Vue 3 + Vite project with Tailwind CSS [ai][model: mimo-v2.5-pro]`

---

## P1：英雄数据爬取 & 存储

### T1.1 存储工具模块
- 创建 `src/utils/storage.js`
  - 封装 localStorage 的 get/set/remove
  - 定义 key 常量：`lol_heroes`、`lol_achievements`、`lol_records`
  - 提供 `exportAll()` / `importAll()` 方法

### T1.2 英雄数据爬取模块
- 创建 `src/utils/crawler.js`
  - 实现 `fetchHeroes()`：fetch 腾讯接口 → 解析 JS 赋值语句 → 提取 heroId/name/title/alias/avatar
  - 失败时 fallback 到 Riot Data Dragon
  - 仍失败时读取 `public/data/heroes.json`
  - 实现 `saveHeroes()` / `loadHeroes()` 与 storage 交互

### T1.3 英雄数据 Store
- 创建 `src/stores/hero.js`（Pinia）
  - state: `heroes[]`, `loading`, `error`
  - actions: `fetchHeroes()`, `refreshHeroes()`
  - getters: `getHeroById(id)`

### T1.4 预爬取英雄数据
- 执行爬取，将结果写入 `public/data/heroes.json` 作为静态缓存
- 确保约 170+ 位英雄数据完整

**提交**：`feat?: add hero data crawler and storage modules [ai][model: mimo-v2.5-pro]`

---

## P2：首页 & 英雄网格

### T2.1 布局组件
- `src/components/layout/AppHeader.vue`
  - Logo 文字
  - 搜索框占位
  - 导航链接：成就管理、设置
- `src/components/layout/AppLayout.vue`
  - Header + main 内容区 + 响应式容器

### T2.2 英雄卡片组件
- `src/components/hero/HeroCard.vue`
  - 英雄头像（img）
  - 中文名 + 称号
  - 完成进度徽章（如 `3/10`）
  - hover 效果：微放大 + 边框高亮
  - 点击跳转到英雄详情页

### T2.3 英雄网格组件
- `src/components/hero/HeroGrid.vue`
  - 响应式网格：手机 2 列 / 平板 3-4 列 / PC 5-6 列
  - 接收 heroes 数组，渲染 HeroCard 列表
  - 加载态骨架屏
  - 空状态提示

### T2.4 首页视图
- `src/views/Home.vue`
  - 挂载时调用 heroStore.fetchHeroes()
  - 渲染 HeroGrid
  - loading / error 状态处理

**提交**：`feat?: add home page with hero grid layout [ai][model: mimo-v2.5-pro]`

---

## P3：搜索功能

### T3.1 搜索工具模块
- `src/utils/search.js`
  - `buildSearchIndex(heroes)`：为每个英雄追加 `_pinyin`、`_pinyinInitial` 字段
  - `createSearchEngine(indexedHeroes)`：初始化 Fuse.js 实例
  - Fuse.js 配置：keys = [name, title, alias, _pinyin, _pinyinInitial]，threshold = 0.3

### T3.2 搜索框组件
- `src/components/hero/HeroSearch.vue`
  - 输入框 + 搜索图标
  - 150ms 防抖
  - emit `search(keyword)` 事件
  - 清空按钮

### T3.3 集成到首页
- Home.vue 集成 HeroSearch + HeroGrid
- 搜索关键词变化 → 调用 search engine → 过滤 heroGrid 数据
- 空输入时显示全部英雄

**提交**：`feat?: add fuzzy search with pinyin support [ai][model: mimo-v2.5-pro]`

---

## P4：成就管理

### T4.1 成就 Store
- `src/stores/achievement.js`
  - state: `achievements[]`
  - actions: `add(achievement)`, `update(id, data)`, `remove(id)`
  - remove 时调用 recordStore.cleanByAchId(id) 清理关联记录
  - 持久化到 localStorage

### T4.2 成就表单组件
- `src/components/achievement/AchievementForm.vue`
  - 新增模式：名称（必填）+ 描述（选填）
  - 编辑模式：回填数据，提交后 emit 更新
  - 表单验证

### T4.3 成就管理页
- `src/views/AchievementManage.vue`
  - 成就列表：名称 + 描述 + 操作（编辑/删除）
  - 新增按钮 → 弹出 AchievementForm
  - 编辑 → 弹出 AchievementForm（预填）
  - 删除 → ConfirmDialog 二次确认
  - 空状态提示

**提交**：`feat?: add achievement management CRUD [ai][model: mimo-v2.5-pro]`

---

## P5：英雄详情 & 成就记录

### T5.1 成就记录 Store
- `src/stores/record.js`
  - state: `records`（`{ [heroId]: { [achId]: Record } }`）
  - actions: `toggle(heroId, achId)`, `updateNote(heroId, achId, note)`, `cleanByAchId(achId)`
  - getters: `getHeroProgress(heroId)` 返回 `{ completed, total }`
  - 持久化到 localStorage

### T5.2 成就项组件
- `src/components/achievement/AchievementItem.vue`
  - Checkbox（已完成/未完成）
  - 成就名称 + 描述
  - 备注输入框（可展开）
  - 完成时间显示
  - emit `toggle` / `updateNote`

### T5.3 进度统计组件
- `src/components/achievement/AchievementStats.vue`
  - 进度条 + 文字（如 `已完成 12 / 30 个成就`）

### T5.4 英雄详情页
- `src/views/HeroDetail.vue`
  - 顶部：英雄头像 + 名称 + 称号 + 返回按钮
  - 进度统计
  - 成就列表：遍历所有 achievements，结合 record 状态渲染 AchievementItem
  - 勾选/取消勾选 → recordStore.toggle()
  - 编辑备注 → recordStore.updateNote()

**提交**：`feat?: add hero detail page with achievement tracking [ai][model: mimo-v2.5-pro]`

---

## P6：设置页 & 数据导入导出

### T6.1 导入导出工具
- `src/utils/export.js`
  - `exportToFile()`：合并 heroes + achievements + records → JSON 下载
  - `importFromFile(file)`：读取 JSON 文件 → 校验格式 → 写入 localStorage → 刷新 stores

### T6.2 设置页
- `src/views/Settings.vue`
  - 主题切换（跟随系统 / 亮色 / 暗色 三选一）→ themeStore.setMode()
  - 刷新英雄数据按钮 → heroStore.refreshHeroes()
  - 导出数据按钮 → exportToFile()
  - 导入数据按钮 → 文件选择 → importFromFile()
  - 清空所有记录按钮 → ConfirmDialog → 清空 localStorage
  - 显示本地数据统计（英雄数、成就数、记录数）

**提交**：`feat?: add settings page with import/export [ai][model: mimo-v2.5-pro]`

---

## P7：细节打磨 & 验收

### T7.1 UI 细节
- 页面切换过渡动画
- 加载态骨架屏优化
- Toast 消息完善（成功/失败/警告）
- 移动端适配测试

### T7.2 边界情况
- 爬取失败时的友好提示
- 导入数据格式校验（字段缺失/类型错误）
- localStorage 满容量处理
- 大量英雄（170+）的列表性能

### T7.3 验收对照
- 对照 PRD 验收标准逐条检查
- 修复发现的问题

**提交**：`feat?: polish UI and handle edge cases [ai][model: mimo-v2.5-pro]`

---

## 开发顺序依赖图

```
T0 (项目初始化)
 ├── T1 (数据爬取 & 存储)
 │    └── T2 (首页 & 英雄网格)
 │         └── T3 (搜索功能)
 ├── T4 (成就管理)
 └── T5 (英雄详情 & 成就记录) ← 依赖 T1 + T4
      └── T6 (设置页 & 导入导出)
           └── T7 (打磨 & 验收)
```

---

**文档结束**
