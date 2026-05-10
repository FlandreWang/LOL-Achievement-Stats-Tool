import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/hero/:id', name: 'HeroDetail', component: () => import('../views/HeroDetail.vue') },
  { path: '/achievements', name: 'Achievements', component: () => import('../views/AchievementManage.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
