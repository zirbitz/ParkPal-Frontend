<script setup>

import Footer from "@/components/Footer.vue";
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <header>
    <Navbar />
  </header>
  <main>
    <router-view />
    <Footer />
  </main>
</template>

<style scoped>

</style>
