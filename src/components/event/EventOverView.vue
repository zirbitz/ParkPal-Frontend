<script setup>
import {computed, onMounted, ref} from 'vue';
import EventCard from "@/components/event/EventCard.vue";
import axios from 'axios';

const events = ref([]); // All events from API
const currentPage = ref(1); // Track the current page
const eventPage = ref(1);
const eventsPerPage = 4;

const totalEventPages = computed(() => Math.ceil(events.value.length / eventsPerPage));

const fetchAllEvents = async () => {
  try {
    const response = await axios.get('http://localhost:8080/events'); // Ensure endpoint is correct
    events.value = response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const paginatedEvents = computed(() => {
  const start = (eventPage.value - 1) * eventsPerPage;
  return events.value.slice(start, start + eventsPerPage);
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

const prevEventPage = () => {
  if (eventPage.value > 1) eventPage.value--;
};
const nextEventPage = () => {
  if (eventPage.value < totalEventPages.value) eventPage.value++;
};
const goToEventPage = (page) => {
  eventPage.value = page;
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
    <div class="row row-cols-2 g-3">
      <div v-for="(event, index) in paginatedEvents" :key="event.id" class="col">
        <EventCard :event="event" />
      </div>
    </div>

    <nav aria-label="Event page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: eventPage === 1 }">
          <button class="page-link" @click="prevEventPage">Previous</button>
        </li>
        <li class="page-item" v-for="page in totalEventPages" :key="page" :class="{ active: eventPage === page }">
          <button class="page-link" @click="goToEventPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: eventPage === totalEventPages }">
          <button class="page-link" @click="nextEventPage">Next</button>
        </li>
      </ul>
    </nav>
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