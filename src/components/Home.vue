<script setup>
import ParkMap from './map/ParkMap.vue';
import UserOverview from "@/components/user/UserOverview.vue";
</script>

<template>
  <div class="container mb-5">
    <h1 class="text-center">Welcome to Park Pal</h1>
    <hr>
    <div class="row">
      <div class="col-lg-6 col-md-12 mb-4">
        <div class="map-container">
          <h2 class="text-center">Welcome to your Hub for Events in Vienna</h2>
          <ParkMap />
        </div>
      </div>

      <div class="col-lg-6 col-md-12 mb-4">
        <h3 class="text-center">Discover over a hundred Events in Vienna!</h3>
        <div class="user-container">
          <UserOverview />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  iframe {
    align-content: center;
  }
}
</style>