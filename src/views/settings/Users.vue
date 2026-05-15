<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ 用户管理</h1>
        <p class="page-desc">管理系统用户和权限</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-sm">添加用户</button>
      </div>
    </div>

    <div class="page-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>admin</td>
              <td>admin@skyguard.com</td>
              <td><span class="type-chip type-FC100">管理员</span></td>
              <td><span class="status-badge status-online">正常</span></td>
              <td>2026-05-13 14:30</td>
              <td>
                <button class="btn btn-sm btn-ghost">编辑</button>
                <button class="btn btn-sm btn-ghost">删除</button>
              </td>
            </tr>
            <tr>
              <td>operator</td>
              <td>operator@skyguard.com</td>
              <td><span class="type-chip type-MAVIC_3">操作员</span></td>
              <td><span class="status-badge status-online">正常</span></td>
              <td>2026-05-13 10:15</td>
              <td>
                <button class="btn btn-sm btn-ghost">编辑</button>
                <button class="btn btn-sm btn-ghost">删除</button>
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
  name: 'SettingsUsers'
}
</script>

<style scoped>
@import '../../assets/css/pages/settings-users.css';
</style>