import { createApp } from "vue";
import { registerSW } from "virtual:pwa-register";
import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");

registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    // check for a new version every minute
    setInterval(() => registration.update(), 60 * 1000);
    // and every time she comes back to the app
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) registration.update();
    });
  },
});
