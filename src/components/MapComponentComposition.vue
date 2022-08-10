<template>
  <div class="map-container">
    <l-map
      ref="mapLeaflet"
      v-model="mapState.zoom"
      v-model:zoom="mapState.zoom"
      :center="[45, 2.9]"
      @ready="onLoad"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>      
      <l-marker
        v-for="property in mapState.propertyMarkers"
        :key="property.id"
        :lat-lng="[property.lat, property.lng]">
        <l-popup>
          <p>
            <h2>
              <a :href="`https://app.bricks.co/properties/${property.id}`" target="_blank">{{ property.address.fr }}</a>
            </h2>
            <img v-bind:src="`${property.imageGallery[0]}`" style="max-height:200px;max-width:450px;"/>
            <br>
          </p>
          <ul>           
            <li>
              Return on investment : {{ property.returnOnInvestment }}% (+{{(property.bricksUser.currentOwned * property.capitalGrowth/10).toFixed(2)}}€/y)
            </li>
            <li>
              Rental dividends : {{ property.rentalDividends }}% ({{(property.bricksUser.currentOwned * property.rentalDividends/10).toFixed(2)}}€/y)
            </li>
            <li>
              Bricks owned : {{ property.bricksUser.currentOwned }} (+{{(property.bricksUser.currentOwned/10 * (property.capitalGrowth + property.rentalDividends)).toFixed(2)}}€/y)
            </li>          
          </ul>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
  <transition name="spinner">
    <div class="loading" v-show="loadingMarkers">
      <div class="loading-text">Loading data, please wait...</div>
      <spinner-component></spinner-component>
    </div>
  </transition>
</template>

<style scoped>
.loading {
  position: absolute;
  bottom: 0;
  z-index: 999;
  left: 50%;
  transform: translate(-50%, 0);
  background-color: #202124;
  border-radius: 15px 15px 0px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 12px 0;
}

.loading-text {
  text-align: center;
  color: aqua;
}

.map-container {
  display: flex;
  flex: 1;
}

.spinner-enter-active,
.spinner-leave-active,
.spinner-enter-to {
  transition: all 0.3s;
}
.spinner-enter,
.spinner-leave-to {
  transition: all 0.3s;
  transform: translate(-50%, 100%);
}
</style>

<script setup lang="ts">

import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import BricksApi, { type Properties } from "../services/bricks-api";
import { ref, reactive } from "vue";
import SpinnerComponent from "./SpinnerComponent.vue";

const mapLeaflet = ref(null);
let loadingMarkers = ref(false);

const mapState = reactive({
  zoom: 5,
  map: {},
  propertyMarkers: [] as Properties[],
});

const onLoad = async () => {
  mapState.map = (mapLeaflet as any).value.leafletObject;
  await loadpropertyMarkers();
};

const loadpropertyMarkers = async () => {
  loadingMarkers.value = true;
  const newMarkers = await BricksApi.getMyProperties();
  mapState.propertyMarkers =  newMarkers.length > 0 ? newMarkers : mapState.propertyMarkers; 
  loadingMarkers.value = false;
};

</script>