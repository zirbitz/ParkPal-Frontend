import {createApp} from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/css/global.css'
import '@popperjs/core'
import 'bootstrap/dist/js/bootstrap.js'
import router from "@/router.js";
import store from "@/store/index.js";

const app = createApp(App);

app.use(router);
app.use(store);
app.mount('#app');
