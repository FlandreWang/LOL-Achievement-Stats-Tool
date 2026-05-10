import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useThemeStore } from './stores/theme'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
