<script setup>
import ParkMap from './map/ParkMap.vue';
import UserOverview from "@/components/user/UserOverview.vue";
import ParksOverview from "@/components/park/ParksOverview.vue";
</script>

<template>
  <div class="container mb-5">
    <h1>Welcome to Park pal</h1>
    <hr>
    <div class="row">
      <div class="col-6">
        <div class="map-container">
          <h2>Welcome to your Hub for Events in Vienna</h2>
          <ParkMap />
        </div>
      </div>

      <div class="col-6">
        <h3>Discover over a hundred Events in Vienna!</h3>

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