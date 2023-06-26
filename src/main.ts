import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

const pinia = createPinia();

createApp(App).use(pinia).mount('#app');

// const data = await fetch('http://localhost:3333/api/data').then(res =>
//   res.json()
// );

// console.log(data);
