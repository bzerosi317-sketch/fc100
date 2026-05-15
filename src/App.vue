<template>
  <div v-if="isLoggedIn" class="app">
    <nav class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-brand">
        <div class="logo">🚀</div>
        <div>
          <div class="brand-text">SkyGuard</div>
          <div class="brand-sub">公网无人机管控平台</div>
        </div>
      </div>
      <div class="sidebar-nav">
        <template v-for="item in navConfig" :key="item.path">
          <div v-if="item.children" class="nav-group" :class="{ open: isSettingsOpen }">
            <div class="nav-item parent" @click="toggleSettings">
              {{ item.icon }} {{ item.label }}
              <i class="nav-arrow">{{ isSettingsOpen ? '▲' : '▼' }}</i>
            </div>
            <div class="nav-children">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="nav-item sub"
                :class="{ active: $route.path === child.path }"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>
          <router-link
            v-else
            :to="item.path"
            class="nav-item"
            :class="{ active: $route.path === item.path }"
          >
            {{ item.icon }} {{ item.label }}
          </router-link>
        </template>
      </div>
      <div class="sidebar-footer">
        <div class="nav-item user-info">
          <span>👤 {{ username }}</span>
        </div>
        <div class="nav-item" @click="handleLogout">
          <i>🚪</i> <span>退出登录</span>
        </div>
        <div class="nav-item" @click="toggleSidebar">
          <i>◀</i> <span>收起侧栏</span>
        </div>
      </div>
    </nav>
    <button class="sidebar-expand" :class="{ show: sidebarCollapsed }" @click="toggleSidebar" title="展开侧栏">▶</button>

    <main class="app-main">
      <header class="app-header">
        <h1>{{ pageTitle }}</h1>
      </header>
      <div class="app-scroll">
        <router-view />
      </div>
    </main>
  </div>

  <router-view v-if="!isLoggedIn" />

  <div id="toastContainer"></div>
  <div id="modalRoot"></div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    const isSettingsOpen = ref(false)
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')
    const username = ref(localStorage.getItem('username') || '')

    const navConfig = [
      { path: '/dashboard', label: '数据看板', icon: '🚀' },
      { path: '/missions', label: '任务管理', icon: '📋' },
      { path: '/waylines', label: '航线管理', icon: '🗺️' },
      { path: '/live', label: '实时监控', icon: '🎥' },
      { path: '/media', label: '媒体中心', icon: '🗂️' },
      { path: '/poles', label: '杆塔台账', icon: '🏗️' },
      { path: '/devices', label: '设备管理', icon: '📡' },
      {
        path: '/settings',
        label: '系统设置',
        icon: '⚙️',
        children: [
          { path: '/settings/platforms', label: '平台接入配置' },
          { path: '/settings/stream', label: '流媒体配置' },
          { path: '/settings/users', label: '用户管理' },
          { path: '/settings/organizations', label: '组织管理' },
          { path: '/settings/logs', label: '系统日志' },
          { path: '/settings/about', label: '关于' }
        ]
      }
    ]

    const pageTitle = computed(() => {
      return route.meta.title || ''
    })

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const toggleSettings = () => {
      isSettingsOpen.value = !isSettingsOpen.value
    }

    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('username')
      isLoggedIn.value = false
      username.value = ''
      router.push('/login')
    }

    const handleShowToast = (e) => {
      const { message, type } = e.detail
      const container = document.getElementById('toastContainer')
      const toast = document.createElement('div')
      toast.className = `toast toast-${type}`
      toast.innerHTML = `<span>${message}</span>`
      container.appendChild(toast)
      requestAnimationFrame(() => toast.classList.add('show'))
      setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => toast.remove(), 300)
      }, 3000)
    }

    onMounted(() => {
      window.addEventListener('show-toast', handleShowToast)
      if (route.path.startsWith('/settings')) {
        isSettingsOpen.value = true
      }
    })

    watch(() => route.path, () => {
      isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
      username.value = localStorage.getItem('username') || ''
    })

    onUnmounted(() => {
      window.removeEventListener('show-toast', handleShowToast)
    })

    return {
      sidebarCollapsed,
      isSettingsOpen,
      isLoggedIn,
      username,
      navConfig,
      pageTitle,
      toggleSidebar,
      toggleSettings,
      handleLogout
    }
  }
}
</script>