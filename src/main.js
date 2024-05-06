import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import '@popperjs/core'
import 'bootstrap/dist/js/bootstrap.js'
import './assets/css/style.css'
import './assets/css/logo.css'
import router from "@/router.js";

const app = createApp(App);

app.use(router);
app.mount('#app');
