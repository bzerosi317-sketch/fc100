<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ 系统日志</h1>
        <p class="page-desc">查看系统运行日志</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="level in logLevels"
          :key="level.value"
          class="filter-tab"
          :class="{ active: filterLevel === level.value }"
          @click="filterLevel = level.value"
        >{{ level.label }}</button>
      </div>
      <div class="search-box">
        <i>🔍</i>
        <input type="text" v-model="searchText" placeholder="搜索日志..." />
      </div>
    </div>

    <div class="page-card">
      <div class="log-list">
        <div v-for="log in filteredLogs" :key="log.id" class="log-item" :class="'log-' + log.level">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-level">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SettingsLogs',
  setup() {
    const filterLevel = ref('all')
    const searchText = ref('')

    const logLevels = [
      { value: 'all', label: '全部' },
      { value: 'info', label: '信息' },
      { value: 'warning', label: '警告' },
      { value: 'error', label: '错误' }
    ]

    const logs = ref([
      { id: 1, time: '2026-05-13 14:30:15', level: 'info', message: '用户 admin 登录系统' },
      { id: 2, time: '2026-05-13 14:28:32', level: 'info', message: '设备 FC100-001 连接成功' },
      { id: 3, time: '2026-05-13 14:25:18', level: 'warning', message: '设备 DOCK-002 响应超时' },
      { id: 4, time: '2026-05-13 14:20:05', level: 'error', message: '任务 #5 执行失败: 航线文件损坏' },
      { id: 5, time: '2026-05-13 14:15:42', level: 'info', message: '航线文件上传成功: 货运航线-03' }
    ])

    const filteredLogs = computed(() => {
      let result = logs.value
      if (filterLevel.value !== 'all') {
        result = result.filter(l => l.level === filterLevel.value)
      }
      if (searchText.value) {
        result = result.filter(l => l.message.toLowerCase().includes(searchText.value.toLowerCase()))
      }
      return result
    })

    return {
      filterLevel,
      searchText,
      logLevels,
      logs,
      filteredLogs
    }
  }
}
</script>

<style scoped>
@import '../../assets/css/pages/settings-logs.css';

.log-list {
  padding: 0;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  font-family: monospace;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--text-muted);
  flex-shrink: 0;
}

.log-level {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.log-info .log-level {
  background: var(--cyan-dim);
  color: var(--cyan);
}

.log-warning .log-level {
  background: var(--amber-dim);
  color: var(--amber);
}

.log-error .log-level {
  background: var(--red-dim);
  color: var(--red);
}

.log-message {
  color: var(--text-secondary);
}
</style>