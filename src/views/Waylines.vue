<template>
  <div class="waylines-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🗺️ 航线管理</h1>
        <p class="page-desc">管理无人机航线文件</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" @click="showImportModal = true">
          <span>+</span> 导入 KMZ/KML
        </button>
      </div>
    </div>

    <div class="page-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>航线名称</th>
              <th>所属组织</th>
              <th>适用机型</th>
              <th>航点数量</th>
              <th>航线长度(km)</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="7">
                <div class="loading-inline">
                  <div class="loading-spinner small"></div>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="waylines.length === 0" class="loading-row">
              <td colspan="7">
                <div class="empty-state"><p>暂无航线数据</p></div>
              </td>
            </tr>
            <tr v-else v-for="wayline in waylines" :key="wayline.id">
              <td>
                <span class="wayline-name">{{ wayline.name }}</span>
                <div class="wayline-desc">{{ wayline.description }}</div>
              </td>
              <td><span class="org-tag">{{ wayline.org }}</span></td>
              <td><span class="type-chip type-FC100">{{ wayline.deviceType }}</span></td>
              <td>{{ wayline.waypointCount }}</td>
              <td>{{ wayline.totalLength }}</td>
              <td>{{ wayline.uploadTime }}</td>
              <td>
                <button class="btn btn-sm btn-ghost" @click="exportWayline(wayline.id)">导出</button>
                <button class="btn btn-sm btn-ghost" @click="deleteWayline(wayline.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="total-count">共 {{ waylines.length }} 条</span>
      </div>
    </div>

    <!-- 导入弹窗 -->
    <div :class="['modal-overlay', { show: showImportModal }]" @click.self="closeImportModal">
      <div class="modal">
        <div class="modal-header">
          <h3><i>📥</i> 导入航线文件</h3>
          <button class="modal-close" @click="closeImportModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>所属组织</label>
            <select v-model="importForm.org">
              <option value="">请选择组织</option>
              <option v-for="org in organizations" :key="org" :value="org">{{ org }}</option>
            </select>
          </div>
          <div class="field">
            <label>航线文件</label>
            <div class="file-drop-zone" @dragover.prevent @drop.prevent="onFileDrop" @click="triggerFileInput">
              <i class="drop-icon">📁</i>
              <span class="drop-text">点击选择或拖拽 .kmz/.kml 文件到此处</span>
              <span class="drop-hint">支持多文件选择，最大 50MB/个</span>
              <input ref="fileInput" type="file" multiple accept=".kmz,.kml" @change="onFileSelect" style="display:none" />
            </div>
            <ul v-if="importFiles.length > 0" class="import-file-list">
              <li v-for="(f, idx) in importFiles" :key="idx" class="import-file-item">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ f.name }}</span>
                <div v-if="f.status === 'uploading'" class="import-progress">
                  <div class="fill" :style="{ width: f.progress + '%' }"></div>
                </div>
                <span :class="['file-status', f.status]">
                  <template v-if="f.status === 'pending'">待上传</template>
                  <template v-else-if="f.status === 'uploading'">{{ f.progress }}%</template>
                  <template v-else-if="f.status === 'completed'">已完成</template>
                  <template v-else-if="f.status === 'failed'">失败</template>
                  <template v-else-if="f.status === 'cancelled'">已取消</template>
                </span>
                <button v-if="f.status === 'pending' || f.status === 'uploading'" class="file-action" @click.stop="cancelFile(idx)">⏹</button>
              </li>
            </ul>
            <p class="import-hint" v-if="importFiles.length > 0">共 {{ importFiles.length }} 个文件</p>
          </div>
        </div>
        <div class="modal-footer">
          <div class="import-actions">
            <button class="btn btn-primary" @click="startImport" :disabled="importFiles.length === 0 || isImporting">导入并解析</button>
            <button class="btn btn-ghost" @click="stopAllImport" v-if="isImporting">停止导入</button>
            <button class="btn btn-ghost" @click="closeImportModal">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { API } from '../api/index.js'
import { Utils } from '../utils/utils.js'

export default {
  name: 'Waylines',
  setup() {
    const waylines = ref([])
    const loading = ref(true)
    const showImportModal = ref(false)
    const fileInput = ref(null)
    const importFiles = ref([])
    const isImporting = ref(false)
    const organizations = ref(['运维部', '巡检部', '应急部'])
    const importForm = ref({ org: '' })

    const loadWaylines = async () => {
      const res = await API.waylines.list()
      if (res.success) {
        waylines.value = res.items
      }
      loading.value = false
    }

    const triggerFileInput = () => {
      if (!isImporting.value) fileInput.value?.click()
    }

    const onFileSelect = (e) => {
      const files = Array.from(e.target.files)
      addFiles(files)
      e.target.value = ''
    }

    const onFileDrop = (e) => {
      const files = Array.from(e.dataTransfer.files).filter(f =>
        f.name.endsWith('.kmz') || f.name.endsWith('.kml')
      )
      addFiles(files)
    }

    const addFiles = (files) => {
      files.forEach(f => {
        if (!importFiles.value.some(ex => ex.name === f.name && ex.size === f.size)) {
          importFiles.value.push({ name: f.name, size: f.size, file: f, status: 'pending', progress: 0 })
        }
      })
    }

    const cancelFile = (idx) => {
      const f = importFiles.value[idx]
      if (f.status === 'pending' || f.status === 'uploading') {
        f.status = 'cancelled'
      }
    }

    const startImport = async () => {
      if (!importForm.value.org) {
        Utils.showToast('请选择所属组织', 'error')
        return
      }
      isImporting.value = true
      for (const f of importFiles.value) {
        if (f.status !== 'pending') continue
        f.status = 'uploading'
        await simulateUpload(f)
      }
      isImporting.value = false
      Utils.showToast('导入完成', 'success')
      loadWaylines()
    }

    const simulateUpload = async (file) => {
      for (let p = 0; p <= 100; p += 10) {
        if (file.status === 'cancelled') return
        file.progress = p
        await new Promise(r => setTimeout(r, 200))
      }
      if (file.status !== 'cancelled') {
        file.status = 'completed'
        file.progress = 100
      }
    }

    const stopAllImport = () => {
      importFiles.value.forEach(f => {
        if (f.status === 'pending' || f.status === 'uploading') f.status = 'cancelled'
      })
      isImporting.value = false
    }

    const closeImportModal = () => {
      if (isImporting.value) return
      showImportModal.value = false
      importFiles.value = []
      importForm.value = { org: '' }
    }

    const exportWayline = async (id) => {
      const res = await API.waylines.export(id)
      if (res.success) {
        Utils.showToast('航线导出成功', 'success')
      }
    }

    const deleteWayline = async (id) => {
      const res = await API.waylines.delete(id)
      if (res.success) {
        Utils.showToast('航线删除成功', 'success')
        loadWaylines()
      }
    }

    onMounted(() => {
      loadWaylines()
    })

    return {
      waylines,
      loading,
      showImportModal,
      fileInput,
      importFiles,
      isImporting,
      organizations,
      importForm,
      loadWaylines,
      triggerFileInput,
      onFileSelect,
      onFileDrop,
      cancelFile,
      startImport,
      stopAllImport,
      closeImportModal,
      exportWayline,
      deleteWayline
    }
  }
}
</script>

<style scoped>
@import '../assets/css/pages/waylines.css';
.file-drop-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px; border: 2px dashed var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; background: var(--bg-input); }
.file-drop-zone:hover { border-color: var(--cyan); background: rgba(0,212,255,0.04); }
.drop-icon { font-size: 2rem; margin-bottom: 8px; }
.drop-text { font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 4px; }
.drop-hint { font-size: var(--fs-xs); color: var(--text-muted); }
</style>