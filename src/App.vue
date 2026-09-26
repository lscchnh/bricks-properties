<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import PropertyList from "./components/PropertyList.vue";
import PropertyMap from "./components/PropertyMap.vue";
import SetupPanel from "./components/SetupPanel.vue";
import SpinnerComponent from "./components/SpinnerComponent.vue";
import { listenToBricks, openedByBookmarklet } from "./bridge/receiver";
import { formatDate } from "./lib/format";
import { usePortfolio } from "./lib/usePortfolio";

const portfolio = usePortfolio();
const { properties, located, unlocated, totalBricks, fetchedAt, status, error, geocodingProgress } =
  portfolio;

const map = useTemplateRef("map");
const showSetup = ref(false);
let stopListening: (() => void) | undefined;
let waitingTimeout: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  stopListening = listenToBricks((message) => {
    clearTimeout(waitingTimeout);
    showSetup.value = false;
    portfolio.receive(message);
  });

  if (openedByBookmarklet()) {
    portfolio.waitForBricks();
    waitingTimeout = setTimeout(() => {
      if (status.value === "waiting") {
        status.value = "error";
        error.value =
          "No data received from Bricks.co. Go back to app.bricks.co, check you are logged in, and click the bookmark again.";
      }
    }, 60_000);
  } else if (unlocated.value.length > 0) {
    portfolio.locateMissing();
  }
});

onBeforeUnmount(() => {
  stopListening?.();
  clearTimeout(waitingTimeout);
});
</script>

<template>
  <header class="header">
    <h1>Bricks properties</h1>
    <p v-if="properties.length > 0" class="summary">
      {{ properties.length }} properties · {{ totalBricks }} bricks
      <span v-if="fetchedAt" class="muted">· updated {{ formatDate(fetchedAt) }}</span>
    </p>
    <nav v-if="properties.length > 0" class="actions">
      <button type="button" @click="showSetup = !showSetup">
        {{ showSetup ? "Back to map" : "How to refresh" }}
      </button>
      <button type="button" @click="portfolio.clear()">Forget data</button>
    </nav>
  </header>

  <p v-if="error" class="banner error" role="alert">{{ error }}</p>

  <main class="content">
    <div v-if="status === 'waiting'" class="waiting">
      <SpinnerComponent />
      <p>Receiving your properties from Bricks.co…</p>
    </div>

    <SetupPanel v-else-if="properties.length === 0 || showSetup" />

    <template v-else>
      <aside class="sidebar">
        <PropertyList :properties="properties" @select="(p) => map?.focus(p)" />
      </aside>
      <PropertyMap ref="map" :properties="located" />
    </template>
  </main>

  <div v-if="status === 'geocoding'" class="toast" role="status">
    Locating addresses… {{ geocodingProgress.done }}/{{ geocodingProgress.total }}
  </div>
  <div v-else-if="status === 'ready' && unlocated.length > 0 && !showSetup" class="toast muted">
    {{ unlocated.length }} address(es) could not be placed on the map.
  </div>
</template>

<style>
@import "@/assets/base.css";

#app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}
</style>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}

h1 {
  margin: 0;
  font-size: 18px;
}

.summary {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.muted {
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.actions button {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg);
  color: var(--text);
}

.actions button:hover {
  background: var(--bg-soft);
}

.banner {
  margin: 0;
  padding: 10px 16px;
}

.error {
  color: var(--danger);
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
}

.content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--border);
}

.waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 8px;
}

.toast {
  position: fixed;
  bottom: 16px;
  left: 50%;
  z-index: 1000;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 13px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
}

.toast.muted {
  background: var(--bg-soft);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

@media (max-width: 720px) {
  .content {
    flex-direction: column-reverse;
  }

  .sidebar {
    width: auto;
    max-height: 35%;
    border-right: 0;
    border-top: 1px solid var(--border);
  }
}
</style>
