<script setup lang="ts">
import { isLocated, type Property } from "@/lib/property";
import { formatPercent } from "@/lib/format";

defineProps<{ properties: Property[] }>();
const emit = defineEmits<{ select: [property: Property & { lat: number; lng: number }] }>();

function select(property: Property) {
  if (isLocated(property)) emit("select", property);
}
</script>

<template>
  <ul class="list">
    <li v-for="property in properties" :key="property.id">
      <button
        type="button"
        :disabled="!isLocated(property)"
        :title="isLocated(property) ? 'Show on the map' : 'Address could not be located'"
        @click="select(property)"
      >
        <span class="address">{{ property.address }}</span>
        <span class="meta">
          {{ property.bricksOwned }} bricks
          <template v-if="property.returnOnInvestment !== undefined">
            · {{ formatPercent(property.returnOnInvestment) }}
          </template>
          <template v-if="!isLocated(property)"> · not located</template>
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

button {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 16px;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: none;
  color: inherit;
  text-align: left;
}

button:hover:not(:disabled) {
  background: var(--bg-soft);
}

button:disabled {
  cursor: default;
  opacity: 0.7;
}

.address {
  font-weight: 500;
}

.meta {
  color: var(--text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
</style>
