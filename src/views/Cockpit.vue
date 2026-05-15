<template>
  <div class="cockpit-page">
    <!-- 顶部导航栏 -->
    <div class="cockpit-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <span>← 返回多路</span>
        </button>
        <div class="device-info">
          <span class="device-name">{{ device.name }}</span>
          <span class="device-type">{{ device.type }}</span>
          <span class="device-status" :class="device.status === 'online' ? 'status-online' : 'status-offline'">
            {{ device.status === 'online' ? '● 在线' : '● 离线' }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <span class="source-label">源: {{ device.platform }}</span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="cockpit-main">
      <!-- 左侧地图区域 -->
      <div class="map-section">
        <div class="map-header">
          <span class="map-title">🗺️ 地图</span>
          <div class="map-controls">
            <button class="map-btn" @click="toggleMapLayer">🛰️ 卫星</button>
            <button class="map-btn" @click="toggleFollow">📍 追踪</button>
          </div>
        </div>
        <div class="map-container">
          <div class="map-placeholder">
            <span class="map-icon">🗺️</span>
            <span class="map-text">设备位置</span>
            <div class="map-markers">
              <div class="marker current">◎ 当前位置</div>
              <div class="marker waypoint">● 航点1</div>
              <div class="marker waypoint">● 航点2</div>
              <div class="marker waypoint completed">✓ 航点3</div>
            </div>
          </div>
        </div>
        <div class="map-legend">
          <span class="legend-item"><span class="dot current"></span> 当前位置</span>
          <span class="legend-item"><span class="dot waypoint"></span> 航点</span>
          <span class="legend-item"><span class="dot completed"></span> 已完成</span>
        </div>
      </div>

      <!-- 中间视频和控制区域 -->
      <div class="center-section">
        <!-- 上方视频区域 -->
        <div class="video-container">
          <div class="video-placeholder">
            <span class="video-icon">📹</span>
            <span class="video-text">实时视频</span>
            <span class="video-hint">设备: {{ device.sn }}</span>
          </div>
          <!-- 任务进度条 -->
          <div class="task-progress" v-if="currentTask">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: taskProgress + '%' }"></div>
            </div>
            <div class="progress-info">
              <span class="progress-percent">{{ taskProgress }}%</span>
              <span class="progress-detail">航点 {{ currentWaypoint }}/{{ totalWaypoints }}</span>
              <span class="progress-distance">已飞 {{ flyDistance }}km</span>
            </div>
          </div>
        </div>

        <!-- 下方飞行控制区域 -->
        <div class="control-section">
          <div class="control-groups">
            <div class="control-group">
              <span class="group-title">✈️ 飞行控制</span>
              <div class="control-buttons">
                <button class="ctrl-btn" v-if="device.type === 'FC100'" @click="executeAction('emergency_stop')">急停</button>
                <button class="ctrl-btn" @click="executeAction('return_home')">返航</button>
                <button class="ctrl-btn" @click="executeAction('land')">降落</button>
                <button class="ctrl-btn" v-if="device.type !== 'FC100'" @click="executeAction('takeoff')">一键起飞</button>
                <button class="ctrl-btn" @click="executeAction('pause_wayline')">{{ isPaused ? '继续' : '暂停航线' }}</button>
              </div>
            </div>
            <div class="control-group" v-if="device.type === 'FC100'">
              <span class="group-title">📷 FPV相机</span>
              <div class="control-buttons">
                <button class="ctrl-btn" @click="executeAction('gimbal_center')">回中</button>
                <button class="ctrl-btn" @click="executeAction('gimbal_down')">垂直向下</button>
              </div>
            </div>
            <div class="control-group" v-if="device.type === 'FC100'">
              <span class="group-title">🏗️ 绞车控制</span>
              <div class="control-buttons">
                <button class="ctrl-btn" @click="executeAction('release_rope')">放绳</button>
                <button class="ctrl-btn" @click="executeAction('retract_rope')">收绳</button>
              </div>
            </div>
            <div class="control-group">
              <span class="group-title">🛠️ 通用</span>
              <div class="control-buttons">
                <button class="ctrl-btn" @click="executeAction('screenshot')">截屏</button>
                <button class="ctrl-btn" @click="toggleRecording">
                  {{ isRecording ? '停止录制' : '录制' }}
                </button>
                <button class="ctrl-btn">
                  画质
                  <select v-model="videoQuality" class="quality-select" @click.stop>
                    <option value="auto">自动</option>
                    <option value="low">流畅</option>
                    <option value="medium">高清</option>
                    <option value="high">超清</option>
                  </select>
                </button>
                <button class="ctrl-btn volume-btn" @click="toggleMute">
                  {{ isMuted ? '🔇' : '🔊' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧仪表盘Tab区域 -->
      <div class="panel-section">
        <div class="panel-tabs">
          <button
            class="panel-tab"
            :class="{ active: activeTab === 'dashboard' }"
            @click="activeTab = 'dashboard'"
          >
            📊 仪表盘
          </button>
          <button
            class="panel-tab"
            :class="{ active: activeTab === 'task' }"
            @click="activeTab = 'task'"
          >
            📋 任务
          </button>
          <button
            class="panel-tab"
            :class="{ active: activeTab === 'alarm' }"
            @click="activeTab = 'alarm'"
          >
            🔔 告警 <span class="alarm-count" v-if="unreadAlarms > 0">{{ unreadAlarms }}</span>
          </button>
        </div>

        <div class="panel-content">
          <!-- 仪表盘 Tab -->
          <div v-if="activeTab === 'dashboard'" class="tab-content dashboard-content">
            <template v-if="device.type === 'FC100'">
              <div class="dashboard-section">
                <h4 class="section-title">设备状态</h4>
                <div class="status-grid">
                  <div class="status-item">
                    <span class="status-label">连接状态</span>
                    <span class="status-value" :class="device.status === 'online' ? 'success' : 'error'">
                      {{ device.status === 'online' ? '在线' : '离线' }}
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">遥控器</span>
                    <span class="status-value success">已连接</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">HMS告警</span>
                    <span class="status-value warning">1条</span>
                  </div>
                </div>
              </div>
              <div class="dashboard-section">
                <h4 class="section-title">飞行参数</h4>
                <div class="param-grid">
                  <div class="param-item">
                    <span class="param-value">{{ device.height || 0 }}</span>
                    <span class="param-label">高度 (m)</span>
                  </div>
                  <div class="param-item">
                    <span class="param-value">{{ device.speed || 0 }}</span>
                    <span class="param-label">水平速度 (m/s)</span>
                  </div>
                  <div class="param-item">
                    <span class="param-value">{{ device.homeDistance || 0 }}</span>
                    <span class="param-label">距Home点 (m)</span>
                  </div>
                </div>
              </div>
              <div class="dashboard-section">
                <h4 class="section-title">电量</h4>
                <div class="battery-display">
                  <div class="battery-visual">
                    <div class="battery-body">
                      <div class="battery-level" :style="{ width: device.battery + '%' }"></div>
                    </div>
                    <div class="battery-cap"></div>
                  </div>
                  <span class="battery-percent">{{ device.battery || 0 }}%</span>
                </div>
              </div>
              <div class="dashboard-section">
                <h4 class="section-title">通信质量</h4>
                <div class="signal-grid">
                  <div class="signal-item">
                    <span class="signal-label">SDR图传</span>
                    <div class="signal-bars">
                      <span class="bar active"></span>
                      <span class="bar active"></span>
                      <span class="bar active"></span>
                      <span class="bar"></span>
                    </div>
                  </div>
                  <div class="signal-item">
                    <span class="signal-label">4G网络</span>
                    <div class="signal-bars">
                      <span class="bar active"></span>
                      <span class="bar active"></span>
                      <span class="bar active"></span>
                      <span class="bar active"></span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="dashboard-section">
                <h4 class="section-title">飞行器状态</h4>
                <div class="status-item full">
                  <span class="status-label">当前状态</span>
                  <span class="status-value">{{ flightStatus }}</span>
                </div>
              </div>
              <div class="dashboard-section">
                <h4 class="section-title">飞行器详情</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">图传质量</span>
                    <span class="detail-value">良好</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">搜星质量</span>
                    <span class="detail-value">12颗</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">电池电量</span>
                    <span class="detail-value">{{ device.battery || 0 }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">高度</span>
                    <span class="detail-value">{{ device.height || 0 }}m</span>
                  </div>
                </div>
              </div>
              <div class="dashboard-section" v-if="device.type === 'M4TD'">
                <h4 class="section-title">机场状态</h4>
                <div class="status-item full">
                  <span class="status-label">设备状态</span>
                  <span class="status-value">{{ device.doorStatus === '关闭' ? '空闲中' : '作业中' }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- 任务 Tab -->
          <div v-if="activeTab === 'task'" class="tab-content task-content">
            <template v-if="currentTask">
              <div class="task-overview">
                <div class="task-header">
                  <span class="task-name">{{ currentTask.name }}</span>
                  <span class="task-type">{{ currentTask.type === '运载' ? '🚁 运载' : '📋 勘察' }}</span>
                </div>
                <div class="task-meta">
                  <span>创建时间: {{ currentTask.createTime }}</span>
                  <span>执行时间: {{ currentTask.executeTime }}</span>
                </div>
              </div>
              <div class="waypoint-list">
                <h4>航点列表</h4>
                <div class="waypoint-item current">
                  <span class="waypoint-num">{{ currentWaypoint }}/{{ totalWaypoints }}</span>
                  <span class="waypoint-name">当前航点</span>
                  <span class="waypoint-distance">已飞 1.2km</span>
                </div>
              </div>
              <div class="event-timeline">
                <h4>事件时间轴</h4>
                <div class="timeline">
                  <div class="timeline-item">
                    <span class="timeline-time">14:30:15</span>
                    <span class="timeline-dot completed"></span>
                    <span class="timeline-text">到达航点2</span>
                  </div>
                  <div class="timeline-item">
                    <span class="timeline-time">14:28:00</span>
                    <span class="timeline-dot completed"></span>
                    <span class="timeline-text">绞车放绳</span>
                  </div>
                  <div class="timeline-item">
                    <span class="timeline-time">14:25:30</span>
                    <span class="timeline-dot completed"></span>
                    <span class="timeline-text">任务开始</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="no-task">
              <span class="no-task-icon">📋</span>
              <span class="no-task-text">当前无进行中的任务</span>
            </div>
          </div>

          <!-- 告警 Tab -->
          <div v-if="activeTab === 'alarm'" class="tab-content alarm-content">
            <div class="alarm-section">
              <h4 class="section-title">🔴 CRITICAL</h4>
              <div class="alarm-list" v-if="criticalAlarms.length > 0">
                <div class="alarm-item critical" v-for="alarm in criticalAlarms" :key="alarm.id">
                  <span class="alarm-time">{{ alarm.time }}</span>
                  <span class="alarm-text">{{ alarm.message }}</span>
                </div>
              </div>
              <div class="no-alarm" v-else>暂无 CRITICAL 告警</div>
            </div>
            <div class="alarm-section">
              <h4 class="section-title">🟡 WARNING</h4>
              <div class="alarm-list" v-if="warningAlarms.length > 0">
                <div class="alarm-item warning" v-for="alarm in warningAlarms" :key="alarm.id">
                  <span class="alarm-time">{{ alarm.time }}</span>
                  <span class="alarm-text">{{ alarm.message }}</span>
                </div>
              </div>
              <div class="no-alarm" v-else>暂无 WARNING 告警</div>
            </div>
            <div class="alarm-section">
              <h4 class="section-title">🔵 INFO</h4>
              <div class="alarm-list" v-if="infoAlarms.length > 0">
                <div class="alarm-item info" v-for="alarm in infoAlarms" :key="alarm.id">
                  <span class="alarm-time">{{ alarm.time }}</span>
                  <span class="alarm-text">{{ alarm.message }}</span>
                </div>
              </div>
              <div class="no-alarm" v-else>暂无 INFO 告警</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Cockpit',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const deviceId = route.params.deviceId

    const device = ref({
      sn: deviceId,
      name: '加载中...',
      type: 'FC100',
      status: 'online',
      platform: '司运',
      height: 0,
      speed: 0,
      battery: 65,
      homeDistance: 150,
      doorStatus: '关闭',
      temperature: 25
    })

    const activeTab = ref('dashboard')
    const isRecording = ref(false)
    const isPaused = ref(false)
    const isMuted = ref(false)
    const videoQuality = ref('auto')
    const taskProgress = ref(50)
    const currentWaypoint = ref(4)
    const totalWaypoints = ref(8)
    const flyDistance = ref(1.2)
    const flightStatus = ref('航线飞行')
    const followEnabled = ref(true)
    const mapLayer = ref('map')

    const currentTask = ref({
      id: 1,
      name: '物资A点投送',
      type: '运载',
      createTime: '2026-05-11 14:00',
      executeTime: '14:00-14:18'
    })

    const unreadAlarms = ref(2)
    const criticalAlarms = ref([
      { id: 1, time: '14:30:00', message: '设备连接中断' }
    ])
    const warningAlarms = ref([
      { id: 2, time: '14:25:00', message: '电量低于30%' }
    ])
    const infoAlarms = ref([])

    const goBack = () => {
      router.push('/live')
    }

    const executeAction = (action) => {
      console.log('执行动作:', action)
      const messages = {
        'emergency_stop': '已发送急停指令',
        'return_home': '已发送返航指令',
        'land': '已发送降落指令',
        'takeoff': '已发送起飞指令',
        'pause_wayline': isPaused.value ? '航线已继续' : '航线已暂停',
        'gimbal_center': '云台已回中',
        'gimbal_down': '云台已垂直向下',
        'release_rope': '绞车放绳中',
        'retract_rope': '绞车收绳中',
        'screenshot': '截图已保存'
      }
      if (messages[action]) {
        alert(messages[action])
      }
      if (action === 'pause_wayline') {
        isPaused.value = !isPaused.value
      }
    }

    const toggleRecording = () => {
      isRecording.value = !isRecording.value
    }

    const toggleMute = () => {
      isMuted.value = !isMuted.value
    }

    const toggleMapLayer = () => {
      mapLayer.value = mapLayer.value === 'map' ? 'satellite' : 'map'
    }

    const toggleFollow = () => {
      followEnabled.value = !followEnabled.value
    }

    const initMockData = () => {
      const deviceMap = {
        'FC100-001': { name: '吊装1号', type: 'FC100', platform: '司运', height: 45, speed: 8, battery: 65, homeDistance: 150 },
        'FC100-002': { name: '吊装2号', type: 'FC100', platform: '司运', height: 30, speed: 5, battery: 80, homeDistance: 80 },
        'M4TD-001': { name: '机场A', type: 'M4TD', platform: 'Skyway2', battery: 90, doorStatus: '关闭', temperature: 25 },
        'M3E-001': { name: '巡检1号', type: 'M3E', platform: '上云API', height: 120, battery: 45 },
        'M3E-002': { name: '巡检2号', type: 'M3E', platform: '上云API', height: 80, battery: 72 }
      }

      const deviceInfo = deviceMap[deviceId] || deviceMap['FC100-001']
      device.value = { ...device.value, ...deviceInfo }
    }

    onMounted(() => {
      initMockData()
    })

    return {
      device,
      activeTab,
      isRecording,
      isPaused,
      isMuted,
      videoQuality,
      taskProgress,
      currentWaypoint,
      totalWaypoints,
      flyDistance,
      flightStatus,
      followEnabled,
      mapLayer,
      currentTask,
      unreadAlarms,
      criticalAlarms,
      warningAlarms,
      infoAlarms,
      goBack,
      executeAction,
      toggleRecording,
      toggleMute,
      toggleMapLayer,
      toggleFollow
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/cockpit.css';
</style>
