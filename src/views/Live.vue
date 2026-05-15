<template>
  <div class="live-monitor-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎥 实时监控</h1>
        <p class="page-desc">多路视频监控，实时掌握设备状态</p>
      </div>
      <div class="page-header-actions">
        <div class="layout-switch">
          <button
            v-for="layout in layouts"
            :key="layout.value"
            class="layout-btn"
            :class="{ active: currentLayout === layout.value }"
            @click="currentLayout = layout.value"
          >
            {{ layout.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="live-container">
      <!-- 左侧设备卡片列表 -->
      <div class="device-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">设备列表</span>
          <span class="device-count">{{ onlineDevices.length }} 台在线</span>
        </div>
        <div class="device-list">
          <div
            v-for="device in allDevices"
            :key="device.sn"
            class="device-card"
            :class="{
              selected: selectedDevices.includes(device.sn),
              offline: device.status !== 'online'
            }"
            @click="toggleDevice(device)"
          >
            <div class="device-card-header">
              <label class="device-checkbox" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedDevices.includes(device.sn)"
                  @change="toggleDevice(device)"
                />
              </label>
              <span class="device-name">{{ device.name }}</span>
            </div>
            <div class="device-card-meta">
              <span class="device-type">{{ device.type }}</span>
              <span class="device-status" :class="device.status === 'online' ? 'status-online' : 'status-offline'">
                {{ device.status === 'online' ? '在线' : '离线' }}
              </span>
            </div>
            <div class="device-osd">
              <template v-if="device.type === 'FC100'">
                <div class="osd-row">
                  <span class="osd-label">高度</span>
                  <span class="osd-value">{{ device.height || '—' }}m</span>
                </div>
                <div class="osd-row">
                  <span class="osd-label">速度</span>
                  <span class="osd-value">{{ device.speed || '—' }}m/s</span>
                </div>
                <div class="osd-row">
                  <span class="osd-label">电量</span>
                  <div class="osd-battery">
                    <div class="battery-bar" :style="{ width: (device.battery || 0) + '%' }"></div>
                  </div>
                  <span class="osd-value">{{ device.battery || 0 }}%</span>
                </div>
                <div class="osd-row" v-if="device.hoistStatus">
                  <span class="osd-label">绞车</span>
                  <span class="osd-value hoist-status">{{ device.hoistStatus }}</span>
                </div>
              </template>
              <template v-else-if="device.type === 'M4TD'">
                <div class="osd-row">
                  <span class="osd-label">舱门</span>
                  <span class="osd-value">{{ device.doorStatus || '—' }}</span>
                </div>
                <div class="osd-row">
                  <span class="osd-label">温度</span>
                  <span class="osd-value">{{ device.temperature || '—' }}°C</span>
                </div>
                <div class="osd-row">
                  <span class="osd-label">电量</span>
                  <div class="osd-battery">
                    <div class="battery-bar" :style="{ width: (device.battery || 0) + '%' }"></div>
                  </div>
                  <span class="osd-value">{{ device.battery || 0 }}%</span>
                </div>
              </template>
              <template v-else>
                <div class="osd-row">
                  <span class="osd-label">高度</span>
                  <span class="osd-value">{{ device.height || '—' }}m</span>
                </div>
                <div class="osd-row">
                  <span class="osd-label">电量</span>
                  <div class="osd-battery">
                    <div class="battery-bar" :style="{ width: (device.battery || 0) + '%' }"></div>
                  </div>
                  <span class="osd-value">{{ device.battery || 0 }}%</span>
                </div>
              </template>
            </div>
            <div class="device-card-actions">
              <button class="btn-cockpit" @click.stop="openCockpit(device)">
                驾驶舱
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧视频网格 -->
      <div class="video-grid-container">
        <div class="video-grid" :class="'layout-' + currentLayout">
          <div
            v-for="device in displayedDevices"
            :key="device.sn"
            class="video-cell"
          >
            <div class="video-placeholder">
              <span class="video-icon">📹</span>
              <span class="video-label">{{ device.name }}</span>
              <span class="video-type">{{ device.type }}</span>
            </div>
            <button class="btn-fullscreen" @click="openCockpit(device)">全屏</button>
          </div>
          <!-- 填充空白格子 -->
          <div
            v-for="n in emptySlots"
            :key="'empty-' + n"
            class="video-cell empty"
          >
            <div class="video-placeholder">
              <span class="video-icon">+</span>
              <span class="video-label">选择设备</span>
            </div>
          </div>
        </div>
        <div class="grid-footer">
          <span class="grid-info">
            已选择 {{ selectedDevices.length }} 台设备
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '../api/index.js'

export default {
  name: 'LiveMonitor',
  setup() {
    const router = useRouter()
    const allDevices = ref([])
    const selectedDevices = ref([])
    const currentLayout = ref(4)

    const layouts = [
      { value: 1, label: '1画面' },
      { value: 4, label: '4画面' },
      { value: 9, label: '9画面' }
    ]

    let refreshTimer = null

    const onlineDevices = computed(() =>
      allDevices.value.filter(d => d.status === 'online')
    )

    const displayedDevices = computed(() => {
      const devices = allDevices.value.filter(d =>
        selectedDevices.value.includes(d.sn) && d.status === 'online'
      )
      return devices.slice(0, currentLayout.value)
    })

    const emptySlots = computed(() => {
      const count = displayedDevices.value.length
      return count < currentLayout.value ? currentLayout.value - count : 0
    })

    const toggleDevice = (device) => {
      const index = selectedDevices.value.indexOf(device.sn)
      if (index === -1) {
        if (selectedDevices.value.length < 9) {
          selectedDevices.value.push(device.sn)
        }
      } else {
        selectedDevices.value.splice(index, 1)
      }
    }

    const openCockpit = (device) => {
      router.push(`/live/${device.sn}/cockpit`)
    }

    const loadDevices = async () => {
      try {
        const res = await API.dashboard.getOnlineDevices()
        if (res.success) {
          allDevices.value = res.devices
        }
      } catch (err) {
        console.error('加载设备失败:', err)
      }
    }

    const initMockData = () => {
      allDevices.value = [
        { sn: 'FC100-001', name: '吊装1号', type: 'FC100', status: 'online', height: 45, speed: 8, battery: 65, hoistStatus: '作业中' },
        { sn: 'FC100-002', name: '吊装2号', type: 'FC100', status: 'online', height: 30, speed: 5, battery: 80, hoistStatus: '待机' },
        { sn: 'M4TD-001', name: '机场A', type: 'M4TD', status: 'online', doorStatus: '关闭', temperature: 25, battery: 90 },
        { sn: 'M4TD-002', name: '机场B', type: 'M4TD', status: 'offline', doorStatus: '关闭', temperature: 22, battery: 45 },
        { sn: 'M3E-001', name: '巡检1号', type: 'M3E', status: 'online', height: 120, battery: 45 },
        { sn: 'M3E-002', name: '巡检2号', type: 'M3E', status: 'online', height: 80, battery: 72 },
        { sn: 'M3E-003', name: '巡检3号', type: 'M3E', status: 'offline', height: 0, battery: 20 }
      ]
      selectedDevices.value = ['FC100-001', 'M4TD-001', 'M3E-001', 'M3E-002']
    }

    onMounted(() => {
      initMockData()
      refreshTimer = setInterval(loadDevices, 10000)
    })

    onUnmounted(() => {
      if (refreshTimer) clearInterval(refreshTimer)
    })

    return {
      allDevices,
      selectedDevices,
      currentLayout,
      layouts,
      onlineDevices,
      displayedDevices,
      emptySlots,
      toggleDevice,
      openCockpit
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/live-monitor.css';
</style>
