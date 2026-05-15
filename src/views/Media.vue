<template>
  <div class="media-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🗂️ 媒体中心</h1>
        <p class="page-desc">管理无人机拍摄的照片和视频</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-ghost" @click="deleteSelected" :disabled="selectedIds.length === 0">
          删除选中
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: filterType === 'all' }"
          @click="filterType = 'all'"
        >全部</button>
        <button
          class="filter-tab"
          :class="{ active: filterType === 'image' }"
          @click="filterType = 'image'"
        >图片</button>
        <button
          class="filter-tab"
          :class="{ active: filterType === 'video' }"
          @click="filterType = 'video'"
        >视频</button>
      </div>
      <div class="search-box">
        <i>🔍</i>
        <input type="text" v-model="searchText" placeholder="搜索文件名..." />
      </div>
    </div>

    <div class="media-grid">
      <div
        v-for="item in filteredMedia"
        :key="item.id"
        class="media-item"
        :class="{ selected: selectedIds.includes(item.id) }"
        @click="toggleSelect(item.id)"
      >
        <div class="media-thumb">
          <span>{{ item.type === 'image' ? '🖼️' : '🎬' }}</span>
        </div>
        <div class="media-info">
          <div class="media-name">{{ item.name }}</div>
          <div class="media-meta">
            <span>{{ item.deviceName }}</span>
            <span>{{ item.size }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredMedia.length === 0" class="coming-soon">
      <div class="coming-icon">📁</div>
      <h2>暂无媒体文件</h2>
      <p>任务执行后会自动上传媒体文件</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { API } from '../api/index.js'
import { Utils } from '../utils/utils.js'

export default {
  name: 'Media',
  setup() {
    const media = ref([])
    const filterType = ref('all')
    const searchText = ref('')
    const selectedIds = ref([])

    const filteredMedia = computed(() => {
      let result = media.value
      if (filterType.value !== 'all') {
        result = result.filter(m => m.type === filterType.value)
      }
      if (searchText.value) {
        result = result.filter(m => m.name.toLowerCase().includes(searchText.value.toLowerCase()))
      }
      return result
    })

    const loadMedia = async () => {
      const res = await API.media.list()
      if (res.success) {
        media.value = res.items
      }
    }

    const toggleSelect = (id) => {
      const index = selectedIds.value.indexOf(id)
      if (index > -1) {
        selectedIds.value.splice(index, 1)
      } else {
        selectedIds.value.push(id)
      }
    }

    const deleteSelected = async () => {
      if (selectedIds.value.length === 0) return
      const res = await API.media.batchDelete(selectedIds.value)
      if (res.success) {
        Utils.showToast('删除成功', 'success')
        selectedIds.value = []
        loadMedia()
      }
    }

    onMounted(() => {
      loadMedia()
    })

    return {
      media,
      filterType,
      searchText,
      selectedIds,
      filteredMedia,
      toggleSelect,
      deleteSelected
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/media.css';
</style>