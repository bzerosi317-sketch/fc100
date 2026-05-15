import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

import './assets/css/app.css'
import './assets/css/pages/dashboard.css'
import './assets/css/pages/devices.css'
import './assets/css/pages/missions.css'
import './assets/css/pages/waylines.css'
import './assets/css/pages/live.css'
import './assets/css/pages/media.css'
import './assets/css/pages/poles.css'
import './assets/css/pages/settings-platforms.css'
import './assets/css/pages/settings-stream.css'
import './assets/css/pages/settings-users.css'
import './assets/css/pages/settings-logs.css'
import './assets/css/pages/settings-about.css'

const app = createApp(App)
app.use(router)
app.mount('#app')