<template>
  <div class="devices-page">
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">已接入设备</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="stat-divider">|</div>
      <div class="stat-item">
        <span class="stat-label">在线</span>
        <span class="stat-value stat-online">{{ stats.online }}</span>
      </div>
      <div class="stat-divider">|</div>
      <div class="stat-item">
        <span class="stat-label">离线</span>
        <span class="stat-value stat-offline">{{ stats.offline }}</span>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: currentFilter === tab.value }"
          @click="setFilter(tab.value)"
        >
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="filter-right">
        <div class="status-filter">
          <button
            class="status-btn"
            :class="{ active: statusFilter === 'all' }"
            @click="setStatusFilter('all')"
          >全部状态</button>
          <button
            class="status-btn"
            :class="{ active: statusFilter === 'online' }"
            @click="setStatusFilter('online')"
          >🟢 在线</button>
          <button
            class="status-btn"
            :class="{ active: statusFilter === 'offline' }"
            @click="setStatusFilter('offline')"
          >🔴 离线</button>
        </div>
        <div class="search-box">
          <i>🔍</i>
          <input
            type="text"
            v-model="searchText"
            placeholder="搜索设备名称/SN..."
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="card-header">
        <span>设备列表</span>
        <div class="card-header-right">
          <span class="auto-refresh">
            <span class="refresh-dot" :class="{ paused: !autoRefresh }"></span>
            <span>{{ autoRefresh ? '每10秒自动刷新' : '已暂停自动刷新' }}</span>
          </span>
          <label class="auto-refresh-toggle">
            <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh" />
            <span>自动刷新</span>
          </label>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('type')">
                设备型号 <span class="sort-icon">↕</span>
              </th>
              <th class="sortable" @click="sortBy('sn')">
                设备SN <span class="sort-icon">↕</span>
              </th>
              <th class="sortable" @click="sortBy('name')">
                设备名称 <span class="sort-icon">↕</span>
              </th>
              <th class="sortable" @click="sortBy('status')">
                在线状态 <span class="sort-icon">↕</span>
              </th>
              <th class="sortable" @click="sortBy('lastSeen')">
                在线时间 <span class="sort-icon">↕</span>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="6">
                <div class="loading-inline">
                  <div class="loading-spinner small"></div>
                  <span>加载设备数据...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredDevices.length === 0" class="loading-row">
              <td colspan="6">
                <div class="empty-state">
                  <p>暂无设备数据</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="device in paginatedDevices"
              :key="device.sn"
              :class="device.status === 'online' ? 'online-row' : 'offline-row'"
            >
              <td>
                <span class="device-type" :class="getTypeClass(device.type)">
                  {{ getDeviceIcon(device.type) }} {{ device.type }}
                </span>
              </td>
              <td><span class="device-sn">{{ device.sn }}</span></td>
              <td>
                <span class="device-name">{{ device.name }}</span>
              </td>
              <td>
                <span class="status-badge" :class="device.status === 'online' ? 'status-online' : 'status-offline'">
                  {{ device.status === 'online' ? '在线' : '离线' }}
                </span>
              </td>
              <td><span class="online-time">{{ device.lastSeen }}</span></td>
              <td>
                <button class="btn-edit" title="编辑">✏️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="footer-left">
          <span class="auto-reg">自动注册: <span>{{ stats.total }}</span> 台</span>
        </div>
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">◀</button>
          <div class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</div>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">▶</button>
        </div>
        <span class="total-count">共 {{ filteredDevices.length }} 条</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { API } from '../api/index.js'

export default {
  name: 'Devices',
  setup() {
    const devices = ref([])
    const loading = ref(true)
    const currentFilter = ref('all')
    const statusFilter = ref('all')
    const searchText = ref('')
    const autoRefresh = ref(true)
    const currentPage = ref(1)
    const pageSize = 10

    const stats = ref({ total: 0, online: 0, offline: 0 })
    const filterTabs = ref([
      { value: 'all', label: '全部', count: 0 },
      { value: 'FC100', label: 'FC100', count: 0 },
      { value: 'M4TD', label: '机场', count: 0 },
      { value: 'M3E', label: '御3', count: 0 }
    ])

    let refreshTimer = null

    const filteredDevices = computed(() => {
      let result = devices.value
      if (currentFilter.value !== 'all') {
        result = result.filter(d => d.type === currentFilter.value)
      }
      if (statusFilter.value !== 'all') {
        result = result.filter(d => d.status === statusFilter.value)
      }
      if (searchText.value) {
        const keyword = searchText.value.toLowerCase()
        result = result.filter(d =>
          d.name.toLowerCase().includes(keyword) ||
          d.sn.toLowerCase().includes(keyword)
        )
      }
      return result
    })

    const totalPages = computed(() => Math.ceil(filteredDevices.value.length / pageSize) || 1)

    const paginatedDevices = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredDevices.value.slice(start, start + pageSize)
    })

    const loadDevices = async () => {
      try {
        const res = await API.devices.list()
        if (res.success) {
          devices.value = res.items
          stats.value = { total: res.total, online: res.online, offline: res.offline }
          updateFilterCounts()
        }
      } catch (err) {
        console.error('加载设备失败:', err)
      } finally {
        loading.value = false
      }
    }

    const updateFilterCounts = () => {
      filterTabs.value[0].count = devices.value.length
      filterTabs.value[1].count = devices.value.filter(d => d.type === 'FC100').length
      filterTabs.value[2].count = devices.value.filter(d => d.type === 'M4TD').length
      filterTabs.value[3].count = devices.value.filter(d => d.type === 'M3E').length
    }

    const setFilter = (value) => {
      currentFilter.value = value
      currentPage.value = 1
    }

    const setStatusFilter = (value) => {
      statusFilter.value = value
      currentPage.value = 1
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const toggleAutoRefresh = () => {
      if (autoRefresh.value) {
        refreshTimer = setInterval(loadDevices, 10000)
      } else {
        clearInterval(refreshTimer)
      }
    }

    const sortBy = (field) => {
      // 排序逻辑
    }

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const getTypeClass = (type) => {
      const map = { 'FC100': 'fc100', 'M4TD': 'm4td' }
      return map[type] || ''
    }

    const getDeviceIcon = (type) => {
      const icons = { 'FC100': '🚁', 'M4TD': '🏢', 'M3E': '🛩️' }
      return icons[type] || '📦'
    }

    onMounted(() => {
      loadDevices()
      refreshTimer = setInterval(loadDevices, 10000)
    })

    onUnmounted(() => {
      if (refreshTimer) clearInterval(refreshTimer)
    })

    return {
      devices,
      loading,
      stats,
      filterTabs,
      currentFilter,
      statusFilter,
      searchText,
      autoRefresh,
      currentPage,
      totalPages,
      filteredDevices,
      paginatedDevices,
      setFilter,
      setStatusFilter,
      handleSearch,
      toggleAutoRefresh,
      sortBy,
      prevPage,
      nextPage,
      getTypeClass,
      getDeviceIcon
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/devices.css';
</style>