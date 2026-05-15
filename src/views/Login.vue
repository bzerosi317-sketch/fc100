<template>
  <div class="login-page" style="background:#060a14;min-height:100vh;">
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-grid"></div>
    </div>
    <div class="login-container" style="position:relative;z-index:1;padding:20px;">
      <div class="login-card" style="background:#111827;border:1px solid rgba(0,212,255,0.12);border-radius:16px;padding:40px;max-width:420px;margin:0 auto;">
        <div class="login-header" style="text-align:center;margin-bottom:32px;">
          <div class="login-logo" style="width:64px;height:64px;margin:0 auto 16px;border-radius:16px;background:linear-gradient(135deg,#00D4FF,#7B61FF);display:flex;align-items:center;justify-content:center;font-size:var(--fs-xxl);">🚀</div>
          <h1 style="font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:4px;">SkyGuard</h1>
          <p style="font-size:0.85rem;color:#64748b;">公网无人机管控平台</p>
        </div>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group" style="margin-bottom:20px;">
            <label style="display:block;font-size:0.8rem;color:#94a3b8;margin-bottom:8px;font-weight:500;">用户名</label>
            <input
              type="text"
              v-model="username"
              placeholder="请输入用户名"
              :class="{ error: error }"
              style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,255,0.12);border-radius:8px;color:#e2e8f0;font-size:0.95rem;box-sizing:border-box;"
            />
          </div>
          <div class="form-group" style="margin-bottom:20px;">
            <label style="display:block;font-size:0.8rem;color:#94a3b8;margin-bottom:8px;font-weight:500;">密码</label>
            <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
              :class="{ error: error }"
              style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,255,0.12);border-radius:8px;color:#e2e8f0;font-size:0.95rem;box-sizing:border-box;"
            />
          </div>
          <div class="error-message" v-if="error" style="color:#FF3366;font-size:0.8rem;margin-bottom:16px;text-align:center;">{{ error }}</div>
          <button type="submit" class="btn-login" :disabled="loading" style="width:100%;padding:14px;background:linear-gradient(135deg,#00D4FF,#0099cc);border:none;border-radius:8px;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span v-if="loading" class="loading-spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;"></span>
            <span v-else>登录</span>
          </button>
        </form>
        
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleLogin = () => {
      error.value = ''

      if (!username.value || !password.value) {
        error.value = '请输入用户名和密码'
        return
      }

      if (username.value === 'admin' && password.value === 'admin') {
        loading.value = true
        setTimeout(() => {
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('username', username.value)
          router.push('/dashboard')
        }, 500)
      } else {
        error.value = '用户名或密码错误'
      }
    }

    return {
      username,
      password,
      error,
      loading,
      handleLogin
    }
  }
}
</script>

<style>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: var(--bg-primary);
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(123, 97, 255, 0.1) 0%, transparent 50%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xxl);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.login-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.login-header p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.login-form .form-group {
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.login-form input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.login-form input::placeholder {
  color: var(--text-muted);
}

.login-form input:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px var(--cyan-dim);
}

.login-form input.error {
  border-color: var(--red);
}

.error-message {
  color: var(--red);
  font-size: 0.8rem;
  margin-bottom: 16px;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--cyan), #0099cc);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-login:hover {
  box-shadow: 0 0 24px rgba(0, 212, 255, 0.4);
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>