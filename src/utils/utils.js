export const Utils = {
  formatTime(timestamp) {
    const date = new Date(timestamp)
    const pad = (n) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  },

  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}小时${m}分${s}秒`
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
  },

  formatNumber(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  },

  debounce(fn, delay = 300) {
    let timer = null
    return function (...args) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), delay)
    }
  },

  throttle(fn, limit = 100) {
    let inThrottle = false
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  showToast(message, type = 'info') {
    const event = new CustomEvent('show-toast', {
      detail: { message, type }
    })
    window.dispatchEvent(event)
  },

  closeModal() {
    const event = new CustomEvent('close-modal')
    window.dispatchEvent(event)
  },

  generateId() {
    return Math.random().toString(36).substring(2, 11)
  },

  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  getUrlParam(name) {
    const url = new URL(window.location.href)
    return url.searchParams.get(name)
  },

  setUrlParam(name, value) {
    const url = new URL(window.location.href)
    url.searchParams.set(name, value)
    window.history.replaceState({}, '', url.toString())
  },

  isOnline() {
    return navigator.onLine
  },

  copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
      this.showToast('已复制到剪贴板', 'success')
      return true
    }).catch(() => {
      this.showToast('复制失败', 'error')
      return false
    })
  }
}