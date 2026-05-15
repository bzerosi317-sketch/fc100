const mockDelay = { min: 200, max: 500 }

function randomDelay() {
  const delay = Math.random() * (mockDelay.max - mockDelay.min) + mockDelay.min
  return new Promise(resolve => setTimeout(resolve, delay))
}

async function request(method, path, data = null) {
  const url = `/api/v1${path}`
  console.log(`[API] ${method.toUpperCase()} ${url}`, data || '')

  try {
    await randomDelay()
    return { success: true }
  } catch (error) {
    console.error(`[API] 请求失败 ${url}:`, error)
    return { success: false, error: error.message }
  }
}

export const API = {
  base: '/api/v1',
  request,

  devices: {
    async list() {
      console.log('[API] 获取设备列表')
      await randomDelay()
      return {
        success: true,
        total: 11, online: 7, offline: 4,
        items: [
          { sn: 'FC100-001', type: 'FC100', name: '吊装1号', status: 'online', lastSeen: '2026-05-11 14:30', platform: '司空2', firmware: 'v3.2.1', height: 45, speed: 8.2, battery: 75, distance: 320 },
          { sn: 'FC100-002', type: 'FC100', name: '吊装2号', status: 'online', lastSeen: '2026-05-11 14:28', platform: '司空2', firmware: 'v3.2.1', height: 38, speed: 6.5, battery: 82, distance: 280 },
          { sn: 'FC100-003', type: 'FC100', name: '吊装3号', status: 'offline', lastSeen: '2026-05-10 18:20', platform: '司空2', firmware: 'v3.1.8' },
          { sn: 'DOCK-001', type: 'M4TD', name: '机场A', status: 'online', lastSeen: '2026-05-11 14:25', platform: '司空2', firmware: 'v2.5.3' },
          { sn: 'DOCK-002', type: 'M4TD', name: '机场B', status: 'offline', lastSeen: '2026-05-10 09:15', platform: '司空2', firmware: 'v2.5.1' },
          { sn: 'M3E-001', type: 'M3E', name: '巡检1号', status: 'online', lastSeen: '2026-05-11 14:29', platform: '司空2', firmware: 'v3.0.5', height: 120, speed: 12.3, battery: 68, distance: 1500 },
          { sn: 'M3E-002', type: 'M3E', name: '巡检2号', status: 'online', lastSeen: '2026-05-11 14:27', platform: '司空2', firmware: 'v3.0.5', height: 85, speed: 9.8, battery: 52, distance: 890 },
          { sn: 'M3E-004', type: 'M3E', name: '勘察1号', status: 'offline', lastSeen: '2026-05-09 16:45', platform: '司空2', firmware: 'v3.0.2' },
          { sn: 'M4TD-001', type: 'M4TD', name: '机场C', status: 'online', lastSeen: '2026-05-11 14:22', platform: '司空2', firmware: 'v2.5.3' },
          { sn: 'FC100-004', type: 'FC100', name: '吊装4号', status: 'online', lastSeen: '2026-05-11 14:15', platform: '司空2', firmware: 'v3.2.1', height: 52, speed: 8.5, battery: 45, distance: 560 },
          { sn: 'M3E-005', type: 'M3E', name: '巡检4号', status: 'offline', lastSeen: '2026-05-08 11:30', platform: '司空2', firmware: 'v3.0.5' }
        ]
      }
    },

    async get(sn) {
      console.log(`[API] 获取设备详情: ${sn}`)
      await randomDelay()
      const allDevices = await this.list()
      const device = allDevices.items.find(d => d.sn === sn)
      return device ? { success: true, data: device } : { success: false, error: '设备不存在' }
    },

    async update(sn, data) {
      console.log(`[API] 更新设备: ${sn}`, data)
      await randomDelay()
      return { success: true, sn, ...data }
    },

    async delete(sn) {
      console.log(`[API] 删除设备: ${sn}`)
      await randomDelay()
      return { success: true }
    }
  },

  missions: {
    async list(params = {}) {
      console.log('[API] 获取任务列表', params)
      await randomDelay()
      return {
        success: true,
        total: 32, today: 8, running: 2, completed: 4, paused: 1, pending: 1,
        items: [
          { id: 1, planTime: '05-11 14:00', actualTime: '14:00-14:18', status: 'running', type: 'auto', planName: '物资A点投送', waylineName: '货运航线-03', waylineId: 1, deviceName: '吊装1号', deviceSn: 'FC100-001', creator: 'admin', media: { uploaded: 3, total: 12, status: 'uploading' } },
          { id: 2, planTime: '05-11 10:00', actualTime: '10:00-10:35', status: 'completed', type: 'auto', planName: '线路巡检-A', waylineName: '巡检航线-A', waylineId: 2, deviceName: '机场A', deviceSn: 'DOCK-001', creator: 'admin', media: { uploaded: 12, total: 12, status: 'done' } },
          { id: 3, planTime: '05-10 09:00', actualTime: '09:02-09:08', status: 'failed', type: 'manual', planName: '物资B点投送', waylineName: '货运航线-01', waylineId: 1, deviceName: '吊装2号', deviceSn: 'FC100-002', creator: 'admin', media: { uploaded: 5, total: 5, status: 'done' } },
          { id: 4, planTime: '05-09 08:00', actualTime: '—', status: 'paused', type: 'manual', planName: '灾损勘察', waylineName: '—', waylineId: null, deviceName: '巡检2号', deviceSn: 'M3E-002', creator: 'admin', media: { uploaded: 0, total: 0, status: 'pending' } },
          { id: 5, planTime: '05-08 15:00', actualTime: '15:00-15:22', status: 'completed', type: 'auto', planName: '例行巡检-B', waylineName: '巡检航线-B', waylineId: 2, deviceName: '机场B', deviceSn: 'DOCK-002', creator: 'admin', media: { uploaded: 8, total: 8, status: 'done' } },
          { id: 6, planTime: '05-07 10:30', actualTime: '10:30-10:45', status: 'completed', type: 'auto', planName: '设备检查', waylineName: '勘察航线-02', waylineId: 3, deviceName: '巡检1号', deviceSn: 'M3E-001', creator: 'admin', media: { uploaded: 6, total: 6, status: 'done' } },
          { id: 7, planTime: '05-06 16:00', actualTime: '16:00-16:30', status: 'pending', type: 'auto', planName: '夜间巡检', waylineName: '巡检航线-C', waylineId: 2, deviceName: '机场C', deviceSn: 'DOCK-003', creator: 'admin', media: { uploaded: 0, total: 15, status: 'pending' } },
          { id: 8, planTime: '05-05 09:30', actualTime: '09:30-10:15', status: 'suspended', type: 'auto', planName: '紧急物资运输', waylineName: '货运航线-02', waylineId: 1, deviceName: '吊装3号', deviceSn: 'FC100-003', creator: 'admin', media: { uploaded: 2, total: 8, status: 'uploading' } },
          { id: 9, planTime: '05-04 14:00', actualTime: '14:00-14:45', status: 'completed', type: 'manual', planName: '临时巡查', waylineName: '—', waylineId: null, deviceName: '巡检3号', deviceSn: 'M3E-003', creator: 'admin', media: { uploaded: 4, total: 4, status: 'done' } },
          { id: 10, planTime: '05-03 11:00', actualTime: '11:05-11:20', status: 'failed', type: 'auto', planName: '精密测量', waylineName: '精密航线-01', waylineId: 3, deviceName: '巡检4号', deviceSn: 'M3E-004', creator: 'admin', media: { uploaded: 0, total: 20, status: 'pending' } }
        ]
      }
    },

    async create(data) {
      console.log('[API] 创建任务', data)
      await randomDelay()
      return { success: true, id: Math.floor(Math.random() * 1000) }
    },

    async update(id, data) {
      console.log(`[API] 更新任务: ${id}`, data)
      await randomDelay()
      return { success: true, id, ...data }
    },

    async delete(id) {
      console.log(`[API] 删除任务: ${id}`)
      await randomDelay()
      return { success: true }
    },

    async execute(id) {
      console.log(`[API] 执行任务: ${id}`)
      await randomDelay()
      return { success: true }
    },

    async pause(id) {
      console.log(`[API] 暂停任务: ${id}`)
      await randomDelay()
      return { success: true }
    },

    async cancel(id) {
      console.log(`[API] 取消任务: ${id}`)
      await randomDelay()
      return { success: true }
    }
  },

  waylines: {
    async list() {
      console.log('[API] 获取航线列表')
      await randomDelay()
      return {
        success: true,
        total: 3,
        items: [
          { id: 1, name: '货运航线-03', deviceType: 'FC100', waypointCount: 8, totalLength: 3.2, uploadTime: '2026-05-11', fileName: 'cargo_route_03.kmz', description: '用于物资运输的标准航线' },
          { id: 2, name: '巡检航线-A', deviceType: 'M3E/M4TD', waypointCount: 15, totalLength: 5.1, uploadTime: '2026-05-10', fileName: 'patrol_route_A.kmz', description: '馈线A段巡检专用航线' },
          { id: 3, name: '勘察航线-01', deviceType: 'FC100', waypointCount: 12, totalLength: 4.8, uploadTime: '2026-05-09', fileName: 'survey_route_01.kmz', description: '灾害勘察应急航线' }
        ]
      }
    },

    async get(id) {
      console.log(`[API] 获取航线详情: ${id}`)
      await randomDelay()
      const allWaylines = await this.list()
      const wayline = allWaylines.items.find(w => w.id === parseInt(id))
      return wayline ? { success: true, data: wayline } : { success: false, error: '航线不存在' }
    },

    async import(file, data) {
      console.log('[API] 导入航线')
      await new Promise(r => setTimeout(r, 500))
      return { success: true, id: Math.floor(Math.random() * 1000) }
    },

    async update(id, data) {
      console.log(`[API] 更新航线: ${id}`, data)
      await randomDelay()
      return { success: true, id, ...data }
    },

    async delete(id) {
      console.log(`[API] 删除航线: ${id}`)
      await randomDelay()
      return { success: true }
    },

    async export(id) {
      console.log(`[API] 导出航线: ${id}`)
      await randomDelay()
      return { success: true, url: `/api/v1/waylines/${id}/export` }
    }
  },

  poles: {
    async list(params = {}) {
      console.log('[API] 获取杆塔列表', params)
      await randomDelay()
      return {
        success: true,
        total: 25,
        items: [
          { id: 1, lineName: '馈线A-01', poleCode: 'A-001', lng: 120.1234, lat: 30.5678, altitude: 45, relatedWaypoint: '航线A-航点3', status: 'normal' },
          { id: 2, lineName: '馈线A-01', poleCode: 'A-002', lng: 120.1345, lat: 30.5789, altitude: 48, relatedWaypoint: '航线A-航点4', status: 'normal' },
          { id: 3, lineName: '馈线B-02', poleCode: 'B-015', lng: 120.1456, lat: 30.5890, altitude: 52, relatedWaypoint: null, status: 'warning' }
        ]
      }
    },

    async create(data) {
      console.log('[API] 创建杆塔', data)
      await randomDelay()
      return { success: true, id: Math.floor(Math.random() * 1000) }
    },

    async update(id, data) {
      console.log(`[API] 更新杆塔: ${id}`, data)
      await randomDelay()
      return { success: true, id, ...data }
    },

    async delete(id) {
      console.log(`[API] 删除杆塔: ${id}`)
      await randomDelay()
      return { success: true }
    }
  },

  media: {
    async list(params = {}) {
      console.log('[API] 获取媒体列表', params)
      await randomDelay()
      return {
        success: true,
        total: 156,
        items: [
          { id: 1, name: 'DSC_001.jpg', deviceName: '巡检1号', missionId: 2, type: 'image', size: '2.3MB', uploadTime: '2026-05-11 10:15', status: 'uploaded', thumbnail: 'thumbnail.jpg' },
          { id: 2, name: 'DSC_002.jpg', deviceName: '巡检1号', missionId: 2, type: 'image', size: '2.1MB', uploadTime: '2026-05-11 10:16', status: 'uploaded', thumbnail: 'thumbnail.jpg' },
          { id: 3, name: 'video_001.mp4', deviceName: '吊装1号', missionId: 1, type: 'video', size: '45.6MB', uploadTime: '2026-05-11 14:18', status: 'uploading', progress: 67 }
        ]
      }
    },

    async download(id) {
      console.log(`[API] 下载媒体: ${id}`)
      await randomDelay()
      return { success: true, url: `/api/v1/media/${id}/download` }
    },

    async delete(id) {
      console.log(`[API] 删除媒体: ${id}`)
      await randomDelay()
      return { success: true }
    },

    async batchDelete(ids) {
      console.log(`[API] 批量删除媒体: ${ids}`)
      await randomDelay()
      return { success: true }
    }
  },

  dashboard: {
    async getStats() {
      console.log('[API] 获取看板统计')
      await randomDelay()
      return {
        success: true,
        stats: {
          totalDevices: 16,
          onlineDevices: 11,
          offlineDevices: 5,
          todayTasks: 12,
          runningTasks: 3
        }
      }
    },

    async getDeviceDistribution() {
      console.log('[API] 获取设备分布')
      await randomDelay()
      return {
        success: true,
        distribution: {
          FC100: 5,
          M4TD: 4,
          M3E: 7,
          online: 11,
          total: 16
        }
      }
    },

    async getTaskStatus() {
      console.log('[API] 获取任务状态')
      await randomDelay()
      return {
        success: true,
        status: {
          running: 3,
          completed: 6,
          failed: 2,
          pending: 1,
          total: 12
        }
      }
    },

    async getOnlineDevices() {
      console.log('[API] 获取在线设备')
      await randomDelay()
      return {
        success: true,
        devices: [
          { sn: 'FC100-001', type: 'FC100', name: '吊装1号', status: 'online', platform: '司运', height: 45, speed: 8.2, battery: 75, winchStatus: 'idle' },
          { sn: 'FC100-002', type: 'FC100', name: '吊装2号', status: 'online', platform: '司运', height: 120, speed: 12.5, battery: 92, winchStatus: 'working' },
          { sn: 'DOCK-001', type: 'M4TD', name: '机场A', status: 'online', platform: 'Skyway2', doorStatus: 'closed', temp: 28, battery: 85 },
          { sn: 'DOCK-002', type: 'M4TD', name: '机场B', status: 'online', platform: 'Skyway2', doorStatus: 'open', temp: 32, battery: 78 },
          { sn: 'M3E-001', type: 'M3E', name: '巡检1号', status: 'online', platform: '上云API', height: 85, zoom: '3.0x', battery: 65 },
          { sn: 'M3E-002', type: 'M3E', name: '巡检2号', status: 'online', platform: '上云API', height: 120, zoom: '5.0x', battery: 88 },
          { sn: 'M3E-003', type: 'M3E', name: '巡检3号', status: 'online', platform: '上云API', height: 45, zoom: '1.0x', battery: 42 },
          { sn: 'M3E-004', type: 'M3E', name: '巡检4号', status: 'online', platform: '上云API', height: 200, zoom: '10.0x', battery: 95 },
          { sn: 'FC100-003', type: 'FC100', name: '吊装3号', status: 'online', platform: '司运', height: 0, speed: 0, battery: 100, winchStatus: 'idle' },
          { sn: 'DOCK-003', type: 'M4TD', name: '机场C', status: 'online', platform: 'Skyway2', doorStatus: 'closed', temp: 25, battery: 92 },
          { sn: 'M3E-005', type: 'M3E', name: '勘察1号', status: 'online', platform: '上云API', height: 150, zoom: '2.0x', battery: 71 }
        ]
      }
    },

    async getRecentTasks() {
      console.log('[API] 获取最近任务')
      await randomDelay()
      return {
        success: true,
        tasks: [
          { id: 1, planTime: '05-13 14:30', actualTime: '14:30-15:45', status: 'running', type: '运载', planName: '物资A点投送', waylineName: '货运航线-03', deviceName: '吊装1号', creator: 'admin', media: { uploaded: 3, total: 15, status: 'uploading' } },
          { id: 2, planTime: '05-13 10:00', actualTime: '10:05-10:45', status: 'running', type: '自动', planName: '线路巡检-A', waylineName: '巡检航线-A', deviceName: '巡检1号', creator: 'admin', media: { uploaded: 8, total: 24, status: 'uploading' } },
          { id: 3, planTime: '05-13 09:00', actualTime: '09:00-09:30', status: 'completed', type: '自动', planName: '机场巡检', waylineName: '机场航线-01', deviceName: '机场A', creator: 'admin', media: { uploaded: 12, total: 12, status: 'done' } },
          { id: 4, planTime: '05-12 16:00', actualTime: '16:00-16:25', status: 'completed', type: '运载', planName: '物资B点投送', waylineName: '货运航线-01', deviceName: '吊装2号', creator: 'admin', media: { uploaded: 6, total: 6, status: 'done' } },
          { id: 5, planTime: '05-12 14:00', actualTime: '14:05-14:12', status: 'failed', type: '自动', planName: '精密巡检', waylineName: '精密航线-02', deviceName: '巡检2号', creator: 'admin', media: { uploaded: 0, total: 20, status: 'pending' } },
          { id: 6, planTime: '05-12 11:00', actualTime: '11:00-11:35', status: 'completed', type: '手动', planName: '临时勘察', waylineName: '-', deviceName: '巡检3号', creator: 'admin', media: { uploaded: 5, total: 5, status: 'done' } },
          { id: 7, planTime: '05-11 15:00', actualTime: '15:00-15:50', status: 'completed', type: '自动', planName: '线路巡检-B', waylineName: '巡检航线-B', deviceName: '机场B', creator: 'admin', media: { uploaded: 18, total: 18, status: 'done' } },
          { id: 8, planTime: '05-11 10:00', actualTime: '10:00-10:28', status: 'failed', type: '运载', planName: '物资C点投送', waylineName: '货运航线-02', deviceName: '吊装3号', creator: 'admin', media: { uploaded: 0, total: 10, status: 'pending' } }
        ]
      }
    },

    async getPlatformStatus() {
      console.log('[API] 获取平台状态')
      await randomDelay()
      return {
        success: true,
        platforms: [
          { name: '司运平台', type: 'FC100', status: 'connected', devices: 5, lastSync: '05-13 14:25' },
          { name: '上云API', type: 'M3E', status: 'connected', devices: 7, lastSync: '05-13 14:20' },
          { name: 'Skyway2', type: 'M4TD', status: 'warning', devices: 4, lastSync: '05-13 14:10' },
          { name: '北向物联', type: 'ECS', status: 'connected', devices: 0, lastSync: '05-13 14:00' }
        ]
      }
    },

    async getFlightStats() {
      console.log('[API] 获取飞行统计')
      await randomDelay()
      return {
        success: true,
        stats: {
          totalFlightHours: 156.8,
          totalFlightKm: 2340.5,
          totalTasks: 328,
          successRate: 94.2
        }
      }
    }
  }
}