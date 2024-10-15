<script setup>
import {computed, onMounted, ref} from 'vue';
import EventCard from "@/components/event/EventCard.vue";
import axios from 'axios';
import {API_ROUTES} from "@/apiRoutes.js";

const events = ref([]); // All events from API
const currentPage = ref(1); // Track the current page
const eventsPerPage = ref(5); // Number of events per page

// Fetch all events from the backend
const fetchAllEvents = async () => {
  try {
    const response = await axios.get(API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS(), {withCredentials: true});
    if (Array.isArray(response.data)) {
      events.value = response.data;
    } else {
      console.error("Expected an array but got:", response.data);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Computed property to get events for the current page
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage.value;
  const end = start + eventsPerPage.value;
  return events.value.slice(start, end);
});

// Compute total pages
const totalPages = computed(() => {
  return Math.ceil(events.value.length / eventsPerPage.value);
});

// Navigate to the next page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Navigate to the previous page
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(() => {
  fetchAllEvents();
});

// Function to handle the updateEvent event
const handleUpdateEvent = (updatedEvent) => {
  const index = events.value.findIndex(event => event.id === updatedEvent.id);
  if (index !== -1) {
    events.value[index] = { ...events.value[index], ...updatedEvent };
  } else {
    console.error('Event not found:', updatedEvent);
  }
};
</script>

<template>
  <div class="container md mb-3">
    <h1>All Events</h1>
    <hr>

    <!-- Display events for the current page -->
    <div class="row">
      <!-- Loop through paginated events -->
      <div
          class="col-12 col-md-6 mb-3 d-flex justify-content-center"
          v-for="(event, index) in paginatedEvents"
          :key="index"
      >
        <EventCard :event="event" class="event-card" @update-event="handleUpdateEvent" />
      </div>
    </div>

    <!-- Pagination controls -->
    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 350px;
}

.event-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 350px;
  height: 100%; /* Ensure that all cards have the same height */
}

.row {
  display: flex;
  flex-wrap: wrap;
}

.col-md-6 {
  display: flex;
  align-items: stretch;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination-controls button {
  margin: 0 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>