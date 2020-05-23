import Vue from 'vue'
import App from './App.vue'
import store from './store'
import { installFilters } from './filters'

Vue.config.productionTip = false

installFilters(Vue)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
