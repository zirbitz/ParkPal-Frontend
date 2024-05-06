<script setup>

import ParkCard from "@/components/park/ParkCard.vue";
</script>

<template>
  <div class="container">
    <h2>Parks</h2>
    <nav class="navbar bg-body-tertiary">
      <div class="d-flex justify-content-start">
        <form class="d-flex justify-content-end" role="search">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </nav>

    <div class="row row-cols-1 row-cols-md-2 g-4">
      <ParkCard
          id="dummy-id-1"
          title="Park 1"
          description="This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer."
          imageUrl="#"
      />
      <ParkCard
          id="dummy-id-2"
          title="Park 2"
          description="This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer."
          imageUrl="#"
      />
      <ParkCard
          id="dummy-id-3"
          title="Park 3"
          description="This is a longer card with supporting text below as a natural lead-in to additional content."
          imageUrl="#"
      />
      <ParkCard
          id="dummy-id-4"
          title="Park 4"
          description="This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer."
          imageUrl="#"
      />
      <ParkCard
          id="dummy-id-5"
          title="Park 5"
          description="This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer."
          imageUrl="#"
      />
      <ParkCard
          id="dummy-id-6"
          title="Park 6"
          description="This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer."
          imageUrl="#"
      />
      <ParkCard
          id="dummy-id-7"
          title="Park 7"
          description="This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer."
          imageUrl="#"
      />
    </div>
  </div>
</template>

<style scoped>

</style>