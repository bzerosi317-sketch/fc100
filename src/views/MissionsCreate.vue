<template>
  <div class="missions-create-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">📋 创建任务</h1>
        <p class="page-desc">{{ currentStepTitle }}</p>
      </div>
      <div class="step-indicator">
        <span v-for="s in steps" :key="s.step" :class="['step-dot', { active: currentStep >= s.step, current: currentStep === s.step }]">
          {{ s.step }}
        </span>
      </div>
    </div>

    <div class="page-card">
      <!-- Step 1: 选择任务类型 -->
      <div v-if="currentStep === 1" class="step-body">
        <div class="type-selector">
          <div :class="['type-card', { selected: form.taskType === 'survey' }]" @click="form.taskType = 'survey'">
            <div class="type-icon">📋</div>
            <div class="type-name">勘察任务</div>
            <div class="type-platform">上云API — 司空2</div>
            <div class="type-desc">适用于御3、机场等设备</div>
          </div>
          <div :class="['type-card', { selected: form.taskType === 'transport' }]" @click="form.taskType = 'transport'">
            <div class="type-icon">🚁</div>
            <div class="type-name">运载任务</div>
            <div class="type-platform">运载互联 — 司运</div>
            <div class="type-desc">适用于 FC100 大载重无人机</div>
          </div>
        </div>
      </div>

      <!-- Step 2: 选择设备 -->
      <div v-if="currentStep === 2" class="step-body">
        <div class="form-group">
          <label>选择设备</label>
          <div v-if="filteredDevices.length === 0" class="empty-hint">暂无可用设备</div>
          <div v-for="d in filteredDevices" :key="d.sn" :class="['device-card', { selected: form.deviceSn === d.sn }]" @click="form.deviceSn = d.sn">
            <div class="device-info">
              <span class="device-name">{{ d.name }}</span>
              <span class="device-type">{{ d.type }}</span>
            </div>
            <div class="device-status" :class="d.status">{{ d.status === 'online' ? '在线' : '离线' }}</div>
          </div>
        </div>
      </div>

      <!-- Step 3: 选择航线 -->
      <div v-if="currentStep === 3" class="step-body">
        <div class="form-group">
          <label>选择航线</label>
          <div v-if="filteredWaylines.length === 0" class="empty-hint">暂无可用航线</div>
          <div v-for="w in filteredWaylines" :key="w.id" :class="['wayline-card', { selected: form.waylineId === w.id }]" @click="form.waylineId = w.id">
            <div class="wayline-info">
              <span class="wayline-name">{{ w.name }}</span>
              <span class="wayline-meta">{{ w.waypointCount }} 航点 · {{ w.totalLength }}km</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: 任务参数 -->
      <div v-if="currentStep === 4" class="step-body">
        <div class="form-group">
          <label>任务名称</label>
          <input type="text" v-model="form.name" placeholder="请输入任务名称" />
        </div>

        <template v-if="form.taskType === 'survey'">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>计划开始时间</label>
              <input type="datetime-local" v-model="form.planTimeStart" />
            </div>
            <div class="form-group flex-1">
              <label>计划结束时间</label>
              <input type="datetime-local" v-model="form.planTimeEnd" />
            </div>
          </div>
          <div class="form-group">
            <label>完成动作</label>
            <select v-model="form.completeAction">
              <option value="return">返航</option>
              <option value="land">降落</option>
              <option value="hover">悬停</option>
            </select>
          </div>
        </template>

        <template v-if="form.taskType === 'transport'">
          <div class="form-group">
            <label>预估载重 (kg)</label>
            <input type="number" v-model="form.estimatedLoad" placeholder="请输入预估载重" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="form.note" rows="4" placeholder="请输入备注信息"></textarea>
          </div>
        </template>
      </div>

      <div class="step-footer">
        <button class="btn btn-ghost" @click="prevStep" v-if="currentStep > 1">上一步</button>
        <div class="step-footer-right">
          <button class="btn btn-ghost" @click="handleCancel">取消</button>
          <button class="btn btn-primary" @click="nextStep" v-if="currentStep < 4">{{ currentStep === 3 ? '下一步' : '下一步' }}</button>
          <button class="btn btn-primary" @click="handleSubmit" v-if="currentStep === 4">创建任务</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '../api/index.js'
import { Utils } from '../utils/utils.js'

export default {
  name: 'MissionsCreate',
  setup() {
    const router = useRouter()
    const currentStep = ref(1)
    const devices = ref([])
    const waylines = ref([])
    const form = ref({
      taskType: '',
      deviceSn: '',
      waylineId: null,
      name: '',
      planTimeStart: '',
      planTimeEnd: '',
      completeAction: 'return',
      estimatedLoad: '',
      note: ''
    })

    const steps = [
      { step: 1, title: '选择任务类型' },
      { step: 2, title: '选择设备' },
      { step: 3, title: '选择航线' },
      { step: 4, title: '任务参数' }
    ]

    const currentStepTitle = computed(() => {
      const s = steps.find(s => s.step === currentStep.value)
      return s ? s.title : ''
    })

    const filteredDevices = computed(() => {
      if (!form.value.taskType) return []
      if (form.value.taskType === 'survey') {
        return devices.value.filter(d => d.type !== 'FC100')
      }
      return devices.value.filter(d => d.type === 'FC100')
    })

    const filteredWaylines = computed(() => {
      const selectedDevice = devices.value.find(d => d.sn === form.value.deviceSn)
      if (!selectedDevice) return waylines.value
      return waylines.value.filter(w => w.deviceType === selectedDevice.type || w.deviceType === 'FC100/M3E/M4TD')
    })

    const loadData = async () => {
      const [deviceRes, waylineRes] = await Promise.all([
        API.devices.list(),
        API.waylines.list()
      ])
      if (deviceRes.success) devices.value = deviceRes.items
      if (waylineRes.success) waylines.value = waylineRes.items
    }

    const nextStep = () => {
      if (currentStep.value === 1 && !form.value.taskType) {
        Utils.showToast('请选择任务类型', 'error')
        return
      }
      if (currentStep.value === 2 && !form.value.deviceSn) {
        Utils.showToast('请选择设备', 'error')
        return
      }
      if (currentStep.value < 4) currentStep.value++
    }

    const prevStep = () => {
      if (currentStep.value > 1) currentStep.value--
    }

    const handleSubmit = async () => {
      if (!form.value.name) {
        Utils.showToast('请输入任务名称', 'error')
        return
      }
      const payload = {
        type: form.value.taskType,
        deviceSn: form.value.deviceSn,
        waylineId: form.value.waylineId,
        name: form.value.name,
        ...(form.value.taskType === 'survey' ? {
          planTimeStart: form.value.planTimeStart,
          planTimeEnd: form.value.planTimeEnd,
          completeAction: form.value.completeAction
        } : {
          estimatedLoad: form.value.estimatedLoad,
          note: form.value.note
        })
      }
      const res = await API.missions.create(payload)
      if (res.success) {
        Utils.showToast('任务创建成功', 'success')
        router.push('/missions')
      }
    }

    const handleCancel = () => {
      router.back()
    }

    onMounted(() => {
      loadData()
    })

    return {
      currentStep,
      devices,
      waylines,
      form,
      steps,
      currentStepTitle,
      filteredDevices,
      filteredWaylines,
      nextStep,
      prevStep,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.missions-create-page { max-width: 800px; }
.step-indicator { display: flex; gap: 8px; align-items: center; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; background: rgba(255,255,255,0.06); color: var(--text-muted); border: 1px solid var(--border-color); }
.step-dot.active { background: var(--cyan-dim); color: var(--cyan); border-color: rgba(0,212,255,0.3); }
.step-dot.current { box-shadow: 0 0 12px rgba(0,212,255,0.2); }
.step-body { padding: 24px; }
.type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.type-card { padding: 24px; border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; text-align: center; transition: all 0.2s; background: var(--bg-input); }
.type-card:hover { border-color: var(--border-hover); }
.type-card.selected { border-color: var(--cyan); background: var(--cyan-dim); box-shadow: 0 0 16px rgba(0,212,255,0.1); }
.type-icon { font-size: 2rem; margin-bottom: 12px; }
.type-name { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.type-platform { font-size: 0.78rem; color: var(--cyan); margin-bottom: 8px; }
.type-desc { font-size: 0.75rem; color: var(--text-muted); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--fs-base); outline: none; transition: all 0.2s; font-family: inherit; box-sizing: border-box; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px var(--cyan-dim); }
.form-row { display: flex; gap: 16px; }
.flex-1 { flex: 1; }
.device-card, .wayline-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; margin-bottom: 8px; transition: all 0.2s; }
.device-card:hover, .wayline-card:hover { border-color: var(--border-hover); }
.device-card.selected, .wayline-card.selected { border-color: var(--cyan); background: var(--cyan-dim); }
.device-info, .wayline-info { display: flex; flex-direction: column; gap: 2px; }
.device-name, .wayline-name { font-size: var(--fs-base); font-weight: 600; color: var(--text-primary); }
.device-type { font-size: var(--fs-xs); color: var(--text-muted); }
.device-status { font-size: var(--fs-xs); padding: 2px 8px; border-radius: 4px; }
.device-status.online { background: var(--green-dim); color: var(--green); }
.device-status.offline { background: var(--red-dim); color: var(--red); }
.wayline-meta { font-size: var(--fs-xs); color: var(--text-muted); }
.empty-hint { padding: 20px; text-align: center; color: var(--text-muted); font-size: var(--fs-sm); }
.step-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-top: 1px solid var(--border-color); }
.step-footer-right { display: flex; gap: 8px; }
</style>