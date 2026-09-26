<script setup lang="ts">
import { computed } from "vue";
import { buildBookmarkletHref, currentSiteUrl } from "@/bridge/bookmarklet";

const bookmarkletHref = computed(() => buildBookmarkletHref(currentSiteUrl()));

// Vue refuses to bind javascript: URLs through :href, so the link is set on the element directly.
const setHref = (el: unknown) => {
  if (el instanceof HTMLAnchorElement) el.setAttribute("href", bookmarkletHref.value);
};
</script>

<template>
  <section class="setup">
    <h2>Show your Bricks.co properties on a map</h2>
    <ol>
      <li>
        Drag this button to your bookmarks bar:
        <a :ref="setHref" class="bookmarklet" @click.prevent>📍 Bricks map</a>
      </li>
      <li>
        Open <a href="https://app.bricks.co" target="_blank" rel="noopener">app.bricks.co</a> and
        log in as usual.
      </li>
      <li>Click the <strong>Bricks map</strong> bookmark: this page opens with your properties.</li>
    </ol>
    <p class="note">
      Your password never goes through this site: the bookmark reads your properties with your
      existing Bricks.co session and sends them straight to this page. Data is only kept in your
      browser. Addresses are located with OpenStreetMap's Nominatim service.
    </p>
    <p class="note">
      Not on Bricks.co yet?
      <a href="https://app.bricks.co/sign-up/LOUCOC57" target="_blank" rel="noopener">Sign up</a>
      (referral link).
    </p>
  </section>
</template>

<style scoped>
.setup {
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 16px;
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

ol {
  padding-left: 20px;
}

li {
  margin-bottom: 12px;
}

.bookmarklet {
  display: inline-block;
  margin-left: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
  text-decoration: none;
  cursor: grab;
}

.note {
  color: var(--text-muted);
  font-size: 13px;
}
</style>
