<template>
  <div class="poles-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🏗️ 杆塔台账</h1>
        <p class="page-desc">管理电力杆塔信息</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" @click="showAddModal = true">
          <span>+</span> 添加杆塔
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: filterLine === 'all' }"
          @click="filterLine = 'all'"
        >全部线路</button>
        <button
          v-for="line in lines"
          :key="line"
          class="filter-tab"
          :class="{ active: filterLine === line }"
          @click="filterLine = line"
        >{{ line }}</button>
      </div>
      <div class="search-box">
        <i>🔍</i>
        <input type="text" v-model="searchText" placeholder="搜索杆塔编号..." />
      </div>
    </div>

    <div class="page-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>线路名称</th>
              <th>杆塔编号</th>
              <th>经度</th>
              <th>纬度</th>
              <th>海拔(m)</th>
              <th>关联航点</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="8">
                <div class="loading-inline">
                  <div class="loading-spinner small"></div>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredPoles.length === 0" class="loading-row">
              <td colspan="8">
                <div class="empty-state"><p>暂无杆塔数据</p></div>
              </td>
            </tr>
            <tr v-else v-for="pole in filteredPoles" :key="pole.id">
              <td>{{ pole.lineName }}</td>
              <td>{{ pole.poleCode }}</td>
              <td>{{ pole.lng }}</td>
              <td>{{ pole.lat }}</td>
              <td>{{ pole.altitude }}</td>
              <td>{{ pole.relatedWaypoint || '—' }}</td>
              <td>
                <span class="status-badge" :class="pole.status === 'normal' ? 'status-online' : 'status-pending'">
                  {{ pole.status === 'normal' ? '正常' : '预警' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost">编辑</button>
                <button class="btn btn-sm btn-ghost">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="total-count">共 {{ filteredPoles.length }} 条</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { API } from '../api/index.js'

export default {
  name: 'Poles',
  setup() {
    const poles = ref([])
    const loading = ref(true)
    const filterLine = ref('all')
    const searchText = ref('')
    const showAddModal = ref(false)

    const lines = computed(() => {
      const lineSet = new Set(poles.value.map(p => p.lineName))
      return Array.from(lineSet)
    })

    const filteredPoles = computed(() => {
      let result = poles.value
      if (filterLine.value !== 'all') {
        result = result.filter(p => p.lineName === filterLine.value)
      }
      if (searchText.value) {
        result = result.filter(p => p.poleCode.toLowerCase().includes(searchText.value.toLowerCase()))
      }
      return result
    })

    const loadPoles = async () => {
      const res = await API.poles.list()
      if (res.success) {
        poles.value = res.items
      }
      loading.value = false
    }

    onMounted(() => {
      loadPoles()
    })

    return {
      poles,
      loading,
      filterLine,
      searchText,
      lines,
      filteredPoles,
      showAddModal
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/poles.css';
</style>