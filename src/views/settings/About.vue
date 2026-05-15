<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ 关于</h1>
        <p class="page-desc">关于 SkyGuard 系统</p>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h4>🚀 系统信息</h4>
        <div class="detail-row">
          <span class="detail-label">系统名称</span>
          <span class="detail-value">SkyGuard 公网无人机管控平台</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">版本号</span>
          <span class="detail-value">v1.0.0</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">构建时间</span>
          <span class="detail-value">2026-05-13</span>
        </div>
      </div>

      <div class="info-card">
        <h4>📡 技术栈</h4>
        <div class="detail-row">
          <span class="detail-label">前端框架</span>
          <span class="detail-value">Vue 3 + Vite</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">路由</span>
          <span class="detail-value">Vue Router 4</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">样式</span>
          <span class="detail-value">原生 CSS (保留原风格)</span>
        </div>
      </div>

      <div class="info-card">
        <h4>📋 功能模块</h4>
        <div class="detail-row">
          <span class="detail-label">数据看板</span>
          <span class="detail-value">✅ 已启用</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">设备管理</span>
          <span class="detail-value">✅ 已启用</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">任务管理</span>
          <span class="detail-value">✅ 已启用</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">航线管理</span>
          <span class="detail-value">✅ 已启用</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">实时画面</span>
          <span class="detail-value">✅ 已启用</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">媒体中心</span>
          <span class="detail-value">✅ 已启用</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsAbout'
}
</script>

<style scoped>
@import '../../assets/css/pages/settings-about.css';
</style>