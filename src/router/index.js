import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '🚀 数据看板', requiresAuth: true }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: () => import('../views/Devices.vue'),
    meta: { title: '📡 设备管理', requiresAuth: true }
  },
  {
    path: '/missions',
    name: 'Missions',
    component: () => import('../views/Missions.vue'),
    meta: { title: '📋 任务管理', requiresAuth: true }
  },
  {
    path: '/missions/create',
    name: 'MissionsCreate',
    component: () => import('../views/MissionsCreate.vue'),
    meta: { title: '📋 创建任务', requiresAuth: true }
  },
  {
    path: '/waylines',
    name: 'Waylines',
    component: () => import('../views/Waylines.vue'),
    meta: { title: '🗺️ 航线管理', requiresAuth: true }
  },
  {
    path: '/live',
    name: 'Live',
    component: () => import('../views/Live.vue'),
    meta: { title: '🎥 实时画面', requiresAuth: true }
  },
  {
    path: '/media',
    name: 'Media',
    component: () => import('../views/Media.vue'),
    meta: { title: '🗂️ 媒体中心', requiresAuth: true }
  },
  {
    path: '/poles',
    name: 'Poles',
    component: () => import('../views/Poles.vue'),
    meta: { title: '🏗️ 杆塔台账', requiresAuth: true }
  },
  {
    path: '/settings/platforms',
    name: 'SettingsPlatforms',
    component: () => import('../views/settings/Platforms.vue'),
    meta: { title: '⚙️ 平台接入配置', requiresAuth: true }
  },
  {
    path: '/settings/stream',
    name: 'SettingsStream',
    component: () => import('../views/settings/Stream.vue'),
    meta: { title: '⚙️ 流媒体配置', requiresAuth: true }
  },
  {
    path: '/settings/users',
    name: 'SettingsUsers',
    component: () => import('../views/settings/Users.vue'),
    meta: { title: '⚙️ 用户管理', requiresAuth: true }
  },
  {
    path: '/settings/logs',
    name: 'SettingsLogs',
    component: () => import('../views/settings/Logs.vue'),
    meta: { title: '⚙️ 系统日志', requiresAuth: true }
  },
  {
    path: '/settings/about',
    name: 'SettingsAbout',
    component: () => import('../views/settings/About.vue'),
    meta: { title: '⚙️ 关于', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `SkyGuard - ${to.meta.title || ''}`

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router