<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🏢 组织管理</h1>
        <p class="page-desc">管理系统组织机构，支持多级架构</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-sm" @click="showModal = true">新建组织</button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i>🔍</i>
        <input
          type="text"
          v-model="searchText"
          placeholder="搜索组织名称..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="page-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>组织名称</th>
              <th>父级组织</th>
              <th>组织层级</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="5">
                <div class="loading-inline">
                  <div class="loading-spinner small"></div>
                  <span>加载组织数据...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredOrganizations.length === 0" class="loading-row">
              <td colspan="5">
                <div class="empty-state">
                  <p>暂无组织数据</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="org in paginatedOrganizations" :key="org.id">
              <td>
                <span class="org-name">{{ org.name }}</span>
              </td>
              <td>
                <span class="parent-org">{{ org.parentName || '—' }}</span>
              </td>
              <td>
                <span class="level-badge" :class="'level-' + org.level">
                  {{ org.level }}级
                </span>
              </td>
              <td>
                <span class="create-time">{{ org.createTime }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost" @click="editOrganization(org)">编辑</button>
                <button class="btn btn-sm btn-ghost btn-danger" @click="deleteOrganization(org)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="total-count">共 {{ filteredOrganizations.length }} 条</span>
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">◀</button>
          <div class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</div>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">▶</button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑组织弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑组织' : '新建组织' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>组织名称 <span class="required">*</span></label>
            <input
              type="text"
              v-model="formData.name"
              placeholder="请输入组织名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>父级组织</label>
            <select v-model="formData.parentId" class="form-input">
              <option value="">无（顶级组织）</option>
              <option v-for="org in availableParents" :key="org.id" :value="org.id">
                {{ org.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>组织层级</label>
            <div class="level-display">
              {{ calculateLevel() }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveOrganization">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <p>确定要删除组织「{{ orgToDelete?.name }}」吗？此操作不可恢复。</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'SettingsOrganizations',
  setup() {
    const organizations = ref([
      { id: 1, name: '总部', parentId: '', parentName: '', level: 1, createTime: '2026-05-01' },
      { id: 2, name: '运维部', parentId: 1, parentName: '总部', level: 2, createTime: '2026-05-02' },
      { id: 3, name: '巡检班组', parentId: 2, parentName: '运维部', level: 3, createTime: '2026-05-03' },
      { id: 4, name: '运输部', parentId: 1, parentName: '总部', level: 2, createTime: '2026-05-04' }
    ])
    const loading = ref(false)
    const searchText = ref('')
    const currentPage = ref(1)
    const pageSize = 10

    const showModal = ref(false)
    const isEditing = ref(false)
    const editingId = ref(null)
    const showDeleteModal = ref(false)
    const orgToDelete = ref(null)

    const formData = ref({
      name: '',
      parentId: ''
    })

    const filteredOrganizations = computed(() => {
      if (!searchText.value) return organizations.value
      const keyword = searchText.value.toLowerCase()
      return organizations.value.filter(org =>
        org.name.toLowerCase().includes(keyword)
      )
    })

    const totalPages = computed(() => Math.ceil(filteredOrganizations.value.length / pageSize) || 1)

    const paginatedOrganizations = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredOrganizations.value.slice(start, start + pageSize)
    })

    const availableParents = computed(() => {
      if (isEditing.value && editingId.value) {
        return organizations.value.filter(org => org.id !== editingId.value && org.level < 3)
      }
      return organizations.value.filter(org => org.level < 3)
    })

    const calculateLevel = () => {
      if (!formData.value.parentId) return '1级'
      const parent = organizations.value.find(org => org.id === formData.value.parentId)
      return parent ? `${parent.level + 1}级` : '1级'
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const editOrganization = (org) => {
      isEditing.value = true
      editingId.value = org.id
      formData.value = {
        name: org.name,
        parentId: org.parentId
      }
      showModal.value = true
    }

    const deleteOrganization = (org) => {
      orgToDelete.value = org
      showDeleteModal.value = true
    }

    const confirmDelete = () => {
      organizations.value = organizations.value.filter(org => org.id !== orgToDelete.value.id)
      closeDeleteModal()
    }

    const closeModal = () => {
      showModal.value = false
      isEditing.value = false
      editingId.value = null
      formData.value = { name: '', parentId: '' }
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      orgToDelete.value = null
    }

    const saveOrganization = () => {
      if (!formData.value.name.trim()) {
        alert('请输入组织名称')
        return
      }

      if (isEditing.value) {
        const index = organizations.value.findIndex(org => org.id === editingId.value)
        if (index !== -1) {
          const parent = organizations.value.find(org => org.id === formData.value.parentId)
          organizations.value[index] = {
            ...organizations.value[index],
            name: formData.value.name,
            parentId: formData.value.parentId,
            parentName: parent ? parent.name : '',
            level: parent ? parent.level + 1 : 1
          }
        }
      } else {
        const parent = organizations.value.find(org => org.id === formData.value.parentId)
        const newOrg = {
          id: Date.now(),
          name: formData.value.name,
          parentId: formData.value.parentId,
          parentName: parent ? parent.name : '',
          level: parent ? parent.level + 1 : 1,
          createTime: new Date().toISOString().split('T')[0]
        }
        organizations.value.push(newOrg)
      }

      closeModal()
    }

    onMounted(() => {
      // 加载组织数据
    })

    return {
      organizations,
      loading,
      searchText,
      currentPage,
      totalPages,
      filteredOrganizations,
      paginatedOrganizations,
      showModal,
      isEditing,
      formData,
      availableParents,
      showDeleteModal,
      orgToDelete,
      handleSearch,
      prevPage,
      nextPage,
      editOrganization,
      deleteOrganization,
      confirmDelete,
      closeModal,
      closeDeleteModal,
      saveOrganization,
      calculateLevel
    }
  }
}
</script>

<style scoped>
@import '../../assets/css/pages/settings-organizations.css';
</style>
