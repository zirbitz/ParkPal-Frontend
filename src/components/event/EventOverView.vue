<script setup>
import { ref, onMounted } from 'vue';
import EventCard from "@/components/event/EventCard.vue";
import axios from 'axios';

const events = ref([]);

const fetchAllEvents = async () => {
  try {
    const response = await axios.get('http://localhost:8080/events');
    if (Array.isArray(response.data)) {
      events.value = response.data;
    } else {
      console.error("Expected an array but got:", response.data);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

onMounted(() => {
  fetchAllEvents();
});
</script>

<template>
  <div class="container md mb-3">
    <h1>
      All Events
    </h1>
    <hr>
    <div class="row text-center">
      <div class="col-sm-6 mb-3 mb-sm-0">
          <!-- Pass the fetched events to EventCard as a prop -->
          <EventCard :events="events" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
