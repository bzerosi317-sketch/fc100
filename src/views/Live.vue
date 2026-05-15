<template>
  <div class="live-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎥 实时画面</h1>
        <p class="page-desc">实时监控无人机画面</p>
      </div>
    </div>

    <div class="platform-tabs">
      <div
        v-for="platform in platforms"
        :key="platform.name"
        class="platform-tab"
        :class="{ active: currentPlatform === platform.name }"
        @click="currentPlatform = platform.name"
      >
        {{ platform.icon }} {{ platform.name }}
        <span class="tab-count">{{ platform.count }}</span>
      </div>
    </div>

    <div class="live-grid">
      <div
        v-for="device in filteredDevices"
        :key="device.sn"
        class="live-card"
        :class="{ online: device.status === 'online' }"
        @click="openCockpit(device)"
      >
        <div class="live-preview">
          <div class="preview-placeholder">
            <span>📹</span>
            <p>点击进入驾驶舱</p>
          </div>
        </div>
        <div class="live-info">
          <div class="device-name">{{ device.name }}</div>
          <div class="device-meta">
            <span class="status-badge" :class="device.status === 'online' ? 'status-online' : 'status-offline'">
              {{ device.status === 'online' ? '🟢 在线' : '🔴 离线' }}
            </span>
            <span class="device-type">{{ device.type }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredDevices.length === 0" class="coming-soon">
      <div class="coming-icon">📡</div>
      <h2>暂无在线设备</h2>
      <p>请确保设备已连接并在线</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '../api/index.js'

export default {
  name: 'Live',
  setup() {
    const router = useRouter()
    const devices = ref([])
    const currentPlatform = ref('全部')

    const platforms = computed(() => [
      { name: '全部', icon: '📱', count: devices.value.length },
      { name: '司运平台', icon: '🚁', count: devices.value.filter(d => d.platform === '司运').length },
      { name: '上云API', icon: '☁️', count: devices.value.filter(d => d.platform === '上云API').length },
      { name: 'Skyway2', icon: '🏢', count: devices.value.filter(d => d.platform === 'Skyway2').length }
    ])

    const filteredDevices = computed(() => {
      if (currentPlatform.value === '全部') return devices.value
      return devices.value.filter(d => d.platform === currentPlatform.value)
    })

    const loadDevices = async () => {
      const res = await API.dashboard.getOnlineDevices()
      if (res.success) {
        devices.value = res.devices
      }
    }

    const openCockpit = (device) => {
      router.push(`/live/${device.sn}/cockpit`)
    }

    onMounted(() => {
      loadDevices()
    })

    return {
      devices,
      currentPlatform,
      platforms,
      filteredDevices,
      openCockpit
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/live.css';
</style>