<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card stat-card--total" @click="navigateTo('/devices')">
        <div class="stat-icon-wrap">📡</div>
        <div class="stat-value">{{ stats.totalDevices }}</div>
        <div class="stat-label">设备总数</div>
      </div>
      <div class="stat-card stat-card--online" @click="navigateTo('/devices')">
        <div class="stat-icon-wrap">🟢</div>
        <div class="stat-value">{{ stats.onlineDevices }}</div>
        <div class="stat-label">在线设备</div>
      </div>
      <div class="stat-card stat-card--offline" @click="navigateTo('/devices')">
        <div class="stat-icon-wrap">🔴</div>
        <div class="stat-value">{{ stats.offlineDevices }}</div>
        <div class="stat-label">离线设备</div>
      </div>
      <div class="stat-card stat-card--mission" @click="navigateTo('/missions')">
        <div class="stat-icon-wrap">📋</div>
        <div class="stat-value">{{ stats.todayTasks }}</div>
        <div class="stat-label">今日任务</div>
      </div>
      <div class="stat-card stat-card--running" @click="navigateTo('/missions')">
        <div class="stat-icon-wrap">🟢</div>
        <div class="stat-value">{{ stats.runningTasks }}</div>
        <div class="stat-label">执行中</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="page-card dashboard-card">
        <div class="card-header">
          <span>📊 设备分布</span>
        </div>
        <div class="card-body">
          <div class="distribution-chart">
            <div class="chart-bar">
              <div class="bar-item">
                <span class="bar-label">FC100</span>
                <div class="bar-track"><div class="bar-fill fc100" :style="{ width: distribution.fc100Pct + '%' }"></div></div>
                <span class="bar-value">{{ distribution.FC100 }}</span>
              </div>
              <div class="bar-item">
                <span class="bar-label">M4TD</span>
                <div class="bar-track"><div class="bar-fill m4td" :style="{ width: distribution.m4tdPct + '%' }"></div></div>
                <span class="bar-value">{{ distribution.M4TD }}</span>
              </div>
              <div class="bar-item">
                <span class="bar-label">M3E</span>
                <div class="bar-track"><div class="bar-fill m3e" :style="{ width: distribution.m3ePct + '%' }"></div></div>
                <span class="bar-value">{{ distribution.M3E }}</span>
              </div>
            </div>
            <div class="online-ratio">
              <span class="ratio-label">在线率</span>
              <span class="ratio-value">{{ distribution.onlineRatio }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-card dashboard-card">
        <div class="card-header">
          <span>📋 任务状态</span>
        </div>
        <div class="card-body">
          <div class="task-bars">
            <div class="task-bar-item">
              <span class="task-label">执行中</span>
              <div class="task-track"><div class="task-fill running" :style="{ width: taskStatus.runningPct + '%' }"></div></div>
              <span class="task-value">{{ taskStatus.running }}</span>
            </div>
            <div class="task-bar-item">
              <span class="task-label">已完成</span>
              <div class="task-track"><div class="task-fill completed" :style="{ width: taskStatus.completedPct + '%' }"></div></div>
              <span class="task-value">{{ taskStatus.completed }}</span>
            </div>
            <div class="task-bar-item">
              <span class="task-label">失败</span>
              <div class="task-track"><div class="task-fill failed" :style="{ width: taskStatus.failedPct + '%' }"></div></div>
              <span class="task-value">{{ taskStatus.failed }}</span>
            </div>
            <div class="task-bar-item">
              <span class="task-label">待执行</span>
              <div class="task-track"><div class="task-fill pending" :style="{ width: taskStatus.pendingPct + '%' }"></div></div>
              <span class="task-value">{{ taskStatus.pending }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-card dashboard-card">
        <div class="card-header">
          <span>🎥 在线设备快捷入口</span>
          <router-link to="/live" class="card-link">查看全部 →</router-link>
        </div>
        <div class="card-body">
          <div class="online-device-list" v-if="onlineDevices.length">
            <div
              v-for="device in onlineDevices"
              :key="device.sn"
              class="online-device-card"
              @click="navigateTo('/live')"
            >
              <div class="device-info">
                <span class="device-name">{{ device.name }}</span>
                <span class="device-type">{{ getDeviceIcon(device.type) }} {{ device.type }}</span>
              </div>
              <div class="device-status">
                <span class="status-badge status-online">🟢 在线</span>
              </div>
              <div class="device-osd">
                <span v-if="device.type === 'FC100'">H:{{ device.height }}m</span>
                <span v-else-if="device.type === 'M4TD'">舱门:{{ device.doorStatus === 'closed' ? '关' : '开' }}</span>
                <span v-else>H:{{ device.height }}m</span>
                <span v-if="device.speed">V:{{ device.speed }}m/s</span>
                <span v-else-if="device.temp">{{ device.temp }}°C</span>
                <span v-else>{{ device.zoom }}</span>
                <span>电量:{{ device.battery }}%</span>
              </div>
              <button class="btn btn-sm btn-primary" @click.stop="navigateTo('/live')">驾驶舱</button>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无在线设备</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-bottom">
      <div class="page-card dashboard-card" style="grid-column: 1 / -1;">
        <div class="card-header">
          <span>📋 最近任务</span>
          <router-link to="/missions" class="card-link">查看全部任务 →</router-link>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>计划时间</th>
                <th>执行状态</th>
                <th>任务名称</th>
                <th>设备</th>
                <th>媒体上传</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in recentTasks" :key="task.id">
                <td>{{ task.planTime }}</td>
                <td>
                  <span class="status-badge" :class="getTaskStatusClass(task.status)">
                    {{ getTaskStatusText(task.status) }}
                  </span>
                </td>
                <td>
                  <span class="task-type">{{ getTaskTypeIcon(task.type) }}</span>
                  {{ task.planName }}
                  <div class="wayline-name" v-if="task.waylineName && task.waylineName !== '-'">{{ task.waylineName }}</div>
                </td>
                <td>{{ task.deviceName }}</td>
                <td>{{ getTaskMediaHtml(task.media) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '../api/index.js'

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const stats = ref({ totalDevices: 0, onlineDevices: 0, offlineDevices: 0, todayTasks: 0, runningTasks: 0 })
    const distribution = ref({ FC100: 0, M4TD: 0, M3E: 0, fc100Pct: 0, m4tdPct: 0, m3ePct: 0, onlineRatio: '--' })
    const taskStatus = ref({ running: 0, completed: 0, failed: 0, pending: 0, runningPct: 0, completedPct: 0, failedPct: 0, pendingPct: 0 })
    const onlineDevices = ref([])
    const recentTasks = ref([])
    let refreshTimer = null

    const navigateTo = (path) => {
      router.push(path)
    }

    const getDeviceIcon = (type) => {
      const icons = { 'FC100': '🚁', 'M4TD': '🏢', 'M3E': '🛩️' }
      return icons[type] || '📦'
    }

    const getTaskStatusClass = (status) => {
      const map = { 'running': 'status-online', 'completed': 'status-completed', 'failed': 'status-offline', 'pending': 'status-pending' }
      return map[status] || ''
    }

    const getTaskStatusText = (status) => {
      const map = { 'running': '🟢 执行中', 'completed': '✅ 已完成', 'failed': '❌ 失败', 'pending': '⏳ 待执行' }
      return map[status] || status
    }

    const getTaskTypeIcon = (type) => {
      return type === '运载' ? '🚁' : type === '自动' ? '📡' : '🎮'
    }

    const getTaskMediaHtml = (media) => {
      if (!media || media.status === 'pending') return '待上传'
      if (media.status === 'uploading') return `${media.uploaded}/${media.total} 上传中 ⬆️`
      return `${media.uploaded}/${media.total} 上传结束 ✅`
    }

    const loadData = async () => {
      try {
        const [statsRes, distRes, taskRes, onlineRes, tasksRes] = await Promise.all([
          API.dashboard.getStats(),
          API.dashboard.getDeviceDistribution(),
          API.dashboard.getTaskStatus(),
          API.dashboard.getOnlineDevices(),
          API.dashboard.getRecentTasks()
        ])

        if (statsRes.success) {
          stats.value = statsRes.stats
        }

        if (distRes.success) {
          const d = distRes.distribution
          const max = Math.max(d.FC100, d.M4TD, d.M3E)
          distribution.value = {
            FC100: d.FC100,
            M4TD: d.M4TD,
            M3E: d.M3E,
            fc100Pct: max > 0 ? d.FC100 / max * 100 : 0,
            m4tdPct: max > 0 ? d.M4TD / max * 100 : 0,
            m3ePct: max > 0 ? d.M3E / max * 100 : 0,
            onlineRatio: d.total > 0 ? `${Math.round(d.online / d.total * 100)}% (${d.online}/${d.total})` : '0%'
          }
        }

        if (taskRes.success) {
          const s = taskRes.status
          const max = Math.max(s.running, s.completed, s.failed, s.pending)
          taskStatus.value = {
            ...s,
            runningPct: max > 0 ? s.running / max * 100 : 0,
            completedPct: max > 0 ? s.completed / max * 100 : 0,
            failedPct: max > 0 ? s.failed / max * 100 : 0,
            pendingPct: max > 0 ? s.pending / max * 100 : 0
          }
        }

        if (onlineRes.success) {
          onlineDevices.value = onlineRes.devices
        }

        if (tasksRes.success) {
          recentTasks.value = tasksRes.tasks
        }
      } catch (err) {
        console.error('[Dashboard] 加载数据失败:', err)
      }
    }

    onMounted(() => {
      loadData()
      refreshTimer = setInterval(loadData, 30000)
    })

    onUnmounted(() => {
      if (refreshTimer) clearInterval(refreshTimer)
    })

    return {
      stats,
      distribution,
      taskStatus,
      onlineDevices,
      recentTasks,
      navigateTo,
      getDeviceIcon,
      getTaskStatusClass,
      getTaskStatusText,
      getTaskTypeIcon,
      getTaskMediaHtml
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/dashboard.css';
</style>