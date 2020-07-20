import Vue from 'vue'
import App from './App.vue'
import store from './store'
import { installFilters } from './filters'

Vue.config.productionTip = false

installFilters(Vue)

// eslint-disable-next-line 
if (PRODUCTION && GOOGLE_ANALYTICS) {
  Vue.use(VueAnalytics, {
    // eslint-disable-next-line 
    id: GOOGLE_ANALYTICS
  })
}

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
