<script setup>
const props = defineProps({
  id: String,
  title: String,
  description: String,
  imageUrl: String,
});
</script>

<template>
  <div class="col">
    <div class="card">
      <img :src="imageUrl" class="card-img-top" :alt="title">
      <div class="card-body">
        <h5 class="card-title">{{title}}</h5>
        <p class="card-text">{{description}}</p>
        <router-link :to="`/parks/${id}`" class="btn btn-primary">More Details</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>