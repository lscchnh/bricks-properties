<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { LMap, LMarker, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import type { Map as LeafletMap, Marker } from "leaflet";
import { nextTick, ref, shallowRef, watch } from "vue";
import type { Property } from "@/lib/property";
import { formatPercent } from "@/lib/format";

type LocatedProperty = Property & { lat: number; lng: number };

const props = defineProps<{ properties: LocatedProperty[] }>();

const zoom = ref(6);
const map = shallowRef<LeafletMap>();
const markers = new Map<string, Marker>();

function onReady(leafletMap: LeafletMap) {
  map.value = leafletMap;
  fitToProperties();
}

function fitToProperties() {
  if (!map.value || props.properties.length === 0) return;
  const bounds = props.properties.map((p) => [p.lat, p.lng] as [number, number]);
  map.value.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
}

function registerMarker(id: string, component: unknown) {
  const leafletObject = (component as { leafletObject?: Marker } | null)?.leafletObject;
  if (leafletObject) markers.set(id, leafletObject);
  else markers.delete(id);
}

async function focus(property: LocatedProperty) {
  map.value?.flyTo([property.lat, property.lng], 14, { duration: 0.8 });
  await nextTick();
  markers.get(property.id)?.openPopup();
}

// Re-frame the map when properties are added (e.g. as geocoding progresses).
watch(
  () => props.properties.length,
  (length, previous) => {
    if (length > (previous ?? 0)) fitToProperties();
  },
);

defineExpose({ focus });
</script>

<template>
  <div class="map">
    <l-map
      v-model:zoom="zoom"
      :center="[46.6, 2.4]"
      :use-global-leaflet="false"
      :options="{ zoomControl: true }"
      @ready="onReady"
    >
      <l-tile-layer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <l-marker
        v-for="property in properties"
        :key="property.id"
        :ref="(c) => registerMarker(property.id, c)"
        :lat-lng="[property.lat, property.lng]"
      >
        <l-popup :options="{ maxWidth: 320 }">
          <div class="popup">
            <img v-if="property.imageUrl" :src="property.imageUrl" alt="" loading="lazy" />
            <a class="title" :href="property.url" target="_blank" rel="noopener">
              {{ property.address }}
            </a>
            <dl>
              <template v-if="property.returnOnInvestment !== undefined">
                <dt>Return on investment</dt>
                <dd>{{ formatPercent(property.returnOnInvestment) }}</dd>
              </template>
              <template v-if="property.rentalDividends !== undefined">
                <dt>Rental dividends</dt>
                <dd>{{ formatPercent(property.rentalDividends) }}</dd>
              </template>
              <dt>Bricks owned</dt>
              <dd>{{ property.bricksOwned }}</dd>
            </dl>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<style scoped>
.map {
  position: relative;
  flex: 1;
  min-height: 0;
  isolation: isolate;
}

.popup {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1c2430;
}

.popup img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 6px;
}

.popup .title {
  font-weight: 600;
  font-size: 14px;
  color: #1f3a5f;
}

.popup dl {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 12px;
  margin: 0;
}

.popup dt {
  color: #5b6573;
}

.popup dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
