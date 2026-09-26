import { createApp } from "vue";
import App from "./App.vue";
import { removeKey } from "./lib/storage";

// Versions before 1.0 stored the Bricks.co session token here; it is no longer needed.
removeKey("Token");

createApp(App).mount("#app");
