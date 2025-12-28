import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/styles/main.css";
import "./assets/styles/prism.css";
import "./assets/styles/math.css";
import "./assets/styles/table.css";
import "./assets/styles/image.css";
import "./assets/styles/search.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
