<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ 流媒体配置</h1>
        <p class="page-desc">管理视频流媒体服务配置</p>
      </div>
    </div>

    <div class="page-card">
      <div class="card-header">
        <span>流媒体服务器</span>
      </div>
      <div class="setting-form">
        <div class="form-group">
          <label>服务器地址</label>
          <input type="text" v-model="config.server" placeholder="rtmp://your-server/live" />
        </div>
        <div class="form-group">
          <label>端口</label>
          <input type="number" v-model="config.port" placeholder="1935" />
        </div>
        <div class="form-group">
          <label>推流密钥</label>
          <input type="text" v-model="config.key" placeholder="输入推流密钥" />
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveConfig">保存配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Utils } from '../../utils/utils.js'

export default {
  name: 'SettingsStream',
  setup() {
    const config = ref({
      server: 'rtmp://localhost/live',
      port: 1935,
      key: ''
    })

    const saveConfig = () => {
      Utils.showToast('配置已保存', 'success')
    }

    return {
      config,
      saveConfig
    }
  }
}
</script>

<style scoped>
@import '../../assets/css/pages/settings-stream.css';
</style>