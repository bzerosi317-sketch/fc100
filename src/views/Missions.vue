<template>
  <div class="missions-page">
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">今日任务</span>
        <span class="stat-value">{{ stats.today }}</span>
      </div>
      <div class="stat-divider">|</div>
      <div class="stat-item">
        <span class="stat-label">执行中</span>
        <span class="stat-value stat-running">{{ stats.running }}</span>
      </div>
      <div class="stat-divider">|</div>
      <div class="stat-item">
        <span class="stat-label">已完成</span>
        <span class="stat-value stat-completed">{{ stats.completed }}</span>
      </div>
      <div class="stat-divider">|</div>
      <div class="stat-item">
        <span class="stat-label">中断</span>
        <span class="stat-value stat-failed">{{ stats.failed }}</span>
      </div>
      <div class="stat-divider">|</div>
      <div class="stat-item">
        <span class="stat-label">待执行</span>
        <span class="stat-value stat-pending">{{ stats.pending }}</span>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-left">
        <div class="filter-group">
          <label>状态</label>
          <select v-model="filterStatus" class="filter-select">
            <option value="all">全部</option>
            <option value="pending">待执行</option>
            <option value="running">执行中</option>
            <option value="paused">已暂停</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>
        </div>
        <div class="filter-group">
          <label>设备</label>
          <select v-model="filterDevice" class="filter-select">
            <option value="all">全部</option>
            <option v-for="d in devices" :key="d.sn" :value="d.sn">{{ d.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>类型</label>
          <select v-model="filterType" class="filter-select">
            <option value="all">全部</option>
            <option value="survey">勘察任务</option>
            <option value="transport">运载任务</option>
          </select>
        </div>
        <div class="filter-group">
          <label>日期</label>
          <select v-model="filterDate" class="filter-select">
            <option value="7">最近7天</option>
            <option value="30">最近30天</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <div class="search-box">
          <i>🔍</i>
          <input type="text" v-model="searchText" placeholder="搜索计划名称" />
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="card-header">
        <span>任务列表</span>
        <div class="header-actions">
          <button class="btn btn-primary" @click="createMission">
            <span>+</span> 创建任务
          </button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>计划时间</th>
              <th>实际时间</th>
              <th>执行状态</th>
              <th>类型</th>
              <th>计划名称</th>
              <th>航线名称</th>
              <th>设备名称</th>
              <th>创建人</th>
              <th>媒体上传</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="10">
                <div class="loading-inline">
                  <div class="loading-spinner small"></div>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredMissions.length === 0" class="loading-row">
              <td colspan="10">
                <div class="empty-state"><p>暂无任务</p></div>
              </td>
            </tr>
            <tr v-else v-for="mission in paginatedMissions" :key="mission.id">
              <td>{{ mission.planTime }}</td>
              <td>{{ mission.actualTime }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(mission.status)">
                  {{ getStatusText(mission.status) }}
                </span>
              </td>
              <td>
                <span class="type-chip" :class="'type-' + mission.type">
                  {{ mission.type === 'survey' ? '勘察任务' : '运载任务' }}
                </span>
              </td>
              <td>{{ mission.planName }}</td>
              <td>{{ mission.waylineName || '—' }}</td>
              <td>{{ mission.deviceName }}</td>
              <td>{{ mission.creator }}</td>
              <td>
                <span :class="['media-status', { clickable: mission.media && mission.media.status !== 'done' }]" @click="triggerUpload(mission)">
                  {{ getMediaStatus(mission.media) }}
                  <i v-if="mission.media && mission.media.status === 'pending'" class="upload-icon">⬆️</i>
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost" @click="showDetail(mission)">详情</button>
                <button class="btn btn-sm btn-primary" v-if="mission.type === 'transport' && mission.status === 'pending'" @click="startMission(mission)">🚀 开始任务</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="footer-left">
          <span class="total-count">共 {{ filteredMissions.length }} 条</span>
        </div>
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">‹</button>
          <span class="page-info">第 {{ currentPage }} 页</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">›</button>
        </div>
      </div>
    </div>

    <div class="status-legend">
      <span class="legend-title">状态分类:</span>
      <span class="legend-item"><span class="legend-dot uncomplete"></span> 未完成（待执行/执行中/已暂停/已挂起）</span>
      <span class="legend-item"><span class="legend-dot complete"></span> 已完成（部分执行/执行成功/执行失败/执行终止）</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '../api/index.js'

export default {
  name: 'Missions',
  setup() {
    const router = useRouter()
    const missions = ref([])
    const devices = ref([])
    const loading = ref(true)
    const currentPage = ref(1)
    const pageSize = 10

    const stats = ref({ today: 0, running: 0, completed: 0, failed: 0, pending: 0 })
    const filterStatus = ref('all')
    const filterDevice = ref('all')
    const filterType = ref('all')
    const filterDate = ref('7')
    const searchText = ref('')

    const filteredMissions = computed(() => {
      let result = missions.value
      if (filterStatus.value !== 'all') {
        result = result.filter(m => m.status === filterStatus.value)
      }
      if (filterDevice.value !== 'all') {
        result = result.filter(m => m.deviceSn === filterDevice.value)
      }
      if (filterType.value !== 'all') {
        result = result.filter(m => m.type === filterType.value)
      }
      if (searchText.value) {
        result = result.filter(m => m.planName.toLowerCase().includes(searchText.value.toLowerCase()))
      }
      return result
    })

    const totalPages = computed(() => Math.ceil(filteredMissions.value.length / pageSize) || 1)

    const paginatedMissions = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredMissions.value.slice(start, start + pageSize)
    })

    const loadData = async () => {
      try {
        const [missionRes, deviceRes] = await Promise.all([
          API.missions.list(),
          API.devices.list()
        ])
        if (missionRes.success) {
          missions.value = missionRes.items
          stats.value = {
            today: missionRes.today,
            running: missionRes.running,
            completed: missionRes.completed,
            failed: missionRes.failed,
            pending: missionRes.pending
          }
        }
        if (deviceRes.success) {
          devices.value = deviceRes.items
        }
      } catch (err) {
        console.error('加载失败:', err)
      } finally {
        loading.value = false
      }
    }

    const uncompleteStatuses = ['pending', 'running', 'paused', 'suspended']
    const getStatusClass = (status) => {
      return uncompleteStatuses.includes(status) ? 'status-badge status-uncomplete' : 'status-badge status-complete'
    }

    const getStatusText = (status) => {
      const map = { 'pending': '待执行', 'running': '执行中', 'paused': '已暂停', 'suspended': '已挂起', 'completed': '已完成', 'failed': '失败', 'partially_completed': '部分执行', 'terminated': '执行终止' }
      return map[status] || status
    }

    const getMediaStatus = (media) => {
      if (!media || media.status === 'pending') return '待上传'
      if (media.status === 'uploading') return `${media.uploaded}/${media.total} 上传中`
      return `${media.uploaded}/${media.total} 上传结束`
    }

    const showDetail = (mission) => {
      console.log('查看任务详情:', mission.id, mission.planName)
    }

    const startMission = (mission) => {
      console.log('开始执行运载任务:', mission.id, mission.planName)
    }

    const triggerUpload = (mission) => {
      console.log('触发媒体上传:', mission.id, mission.planName)
    }

    const createMission = () => {
      router.push('/missions/create')
    }

    const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

    onMounted(() => {
      loadData()
    })

    return {
      missions,
      devices,
      loading,
      stats,
      currentPage,
      totalPages,
      filterStatus,
      filterDevice,
      filterType,
      filterDate,
      searchText,
      filteredMissions,
      paginatedMissions,
      getStatusClass,
      getStatusText,
      getMediaStatus,
      createMission,
      showDetail,
      startMission,
      triggerUpload,
      prevPage,
      nextPage
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/missions.css';
.media-status { display: inline-flex; align-items: center; gap: 4px; cursor: default; }
.media-status.clickable { cursor: pointer; color: var(--cyan); }
.media-status.clickable:hover { text-decoration: underline; }
.upload-icon { font-size: 0.85rem; }
</style>