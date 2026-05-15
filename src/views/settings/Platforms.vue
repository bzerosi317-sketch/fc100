<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ 平台接入配置</h1>
        <p class="page-desc">管理无人机平台接入配置</p>
      </div>
    </div>

    <div class="page-card">
      <div class="card-header">
        <span>平台列表</span>
        <div class="header-actions">
          <button class="btn btn-primary btn-sm">添加平台</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>平台名称</th>
              <th>平台类型</th>
              <th>状态</th>
              <th>设备数量</th>
              <th>最后同步</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>司运平台</td>
              <td><span class="type-chip type-FC100">FC100</span></td>
              <td><span class="status-badge status-online">🟢 已连接</span></td>
              <td>5</td>
              <td>05-13 14:25</td>
              <td>
                <button class="btn btn-sm btn-ghost">编辑</button>
                <button class="btn btn-sm btn-ghost">断开</button>
              </td>
            </tr>
            <tr>
              <td>上云API</td>
              <td><span class="type-chip type-FC100">M3E</span></td>
              <td><span class="status-badge status-online">🟢 已连接</span></td>
              <td>7</td>
              <td>05-13 14:20</td>
              <td>
                <button class="btn btn-sm btn-ghost">编辑</button>
                <button class="btn btn-sm btn-ghost">断开</button>
              </td>
            </tr>
            <tr>
              <td>Skyway2</td>
              <td><span class="type-chip type-DOCK_M4TD">M4TD</span></td>
              <td><span class="status-badge status-pending">⚠️ 警告</span></td>
              <td>4</td>
              <td>05-13 14:10</td>
              <td>
                <button class="btn btn-sm btn-ghost">编辑</button>
                <button class="btn btn-sm btn-ghost">断开</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPlatforms'
}
</script>

<style scoped>
@import '../../assets/css/pages/settings-platforms.css';
</style>