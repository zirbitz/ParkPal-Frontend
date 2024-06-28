<script setup>

</script>

<template>
  <div class="container">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active"><router-link :to="{ name:'Home' }" class="">Home</router-link></li>
        <li class="breadcrumb-item"><router-link :to="{name:'ParksOverview'}" class="">Parks</router-link></li>
        <li class="breadcrumb-item"><router-link :to="{name:'EventOverview'}" class="">Events</router-link></li>
        <li class="breadcrumb-item"><router-link :to="{ name: 'CreateEvent' }" class="">Create Event</router-link></li>
      </ol>
    </nav>
  </div>
</template>

<style scoped>

</style>