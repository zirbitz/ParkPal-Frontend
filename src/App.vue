<script setup>

import Footer from "@/components/Footer.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import Navbar from "@/components/Navbar.vue";
import OffCanvas from "@/components/OffCanvas.vue";

</script>

<template>
  <header>
    <Navbar />
  </header>
  <main>
    <OffCanvas />
    <Breadcrumb />
    <router-view />
    <Footer />
  </main>
</template>

<style scoped>

</style>
