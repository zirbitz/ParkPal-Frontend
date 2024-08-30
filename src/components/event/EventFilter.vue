<script setup>

import EventCard from "@/components/event/EventCard.vue";
</script>

<template>
  <div class="container">
    <h1>
      EventFilter
    </h1>
    <hr>
    <div class="col mb-5">
      <form class="row g-3">
        <div class="col-md-6">
          <label for="eventName" class="form-label">Event Name</label>
          <input type="text" class="form-control" id="eventName" placeholder="Enter event name">
        </div>


        <div class="col-md-6">
          <label for="location" class="form-label">Location</label>
          <input type="text" class="form-control" id="location" placeholder="Enter location">
        </div>


        <div class="col-md-6">
          <label for="creator" class="form-label">Created By</label>
          <input type="text" class="form-control" id="creator" placeholder="Enter creator name">
        </div>


        <div class="col-md-6">
          <label for="eventDate" class="form-label">Event Date</label>
          <input type="date" class="form-control" id="eventDate">
        </div>


        <div class="col-12">
          <button type="submit" class="btn btn-primary">Search</button>
        </div>
      </form>
    </div>

    <div class="row mb-3">
      <div class="col-sm-6 mb-3 mb-sm-0">
        <div class="col-sm-6">
          <EventCard />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>