<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import EventCard from "@/components/event/EventCard.vue";
import axios from 'axios';
import { API_ROUTES } from "@/apiRoutes.js";

const events = ref([]);
const eventPage = ref(1);
const eventsPerPage = ref(3);

const totalEventPages = computed(() => Math.ceil(events.value.length / eventsPerPage.value) || 1);

const fetchAllEvents = async () => {
  try {
    const response = await axios.get(API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS());
    events.value = response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const paginatedEvents = computed(() => {
  const start = (eventPage.value - 1) * eventsPerPage.value;
  return events.value.slice(start, start + eventsPerPage.value);
});

const goToPage = (page) => {
  if (page > 0 && page <= totalEventPages.value) {
    eventPage.value = page;
  }
};

const prevEventPage = () => {
  if (eventPage.value > 1) eventPage.value--;
};

const nextEventPage = () => {
  if (eventPage.value < totalEventPages.value) eventPage.value++;
};

const updateEventsPerPage = () => {
  const width = window.innerWidth;
  if (width < 576) {
    eventsPerPage.value = 1;
  } else if (width < 768) {
    eventsPerPage.value = 2;
  } else {
    eventsPerPage.value = 3;
  }
};

onMounted(() => {
  fetchAllEvents();
  updateEventsPerPage();
  window.addEventListener('resize', updateEventsPerPage);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateEventsPerPage);
});

const handleUpdateEvent = (updatedEvent) => {
  const index = events.value.findIndex(event => event.id === updatedEvent.id);
  if (index !== -1) {
    events.value[index] = {...events.value[index], ...updatedEvent};
  } else {
    console.error('Event not found:', updatedEvent);
  }
};
</script>

<template>
  <div class="container-fluid mb-3">
    <h1 class="text-center mt-3">All Events</h1>
    <hr>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 g-3 mb-5">
      <div v-for="(event, index) in paginatedEvents" :key="event.id" class="col d-flex justify-content-center">
        <EventCard :event="event"/>
      </div>
    </div>

    <!-- Pagination Controls -->
    <nav v-if="totalEventPages > 1" aria-label="Page navigation">
      <ul class="pagination justify-content-center flex-wrap custom-pagination-spacing">
        <!-- Previous Button -->
        <li class="page-item" :class="{ disabled: eventPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(eventPage - 1)">Previous</a>
        </li>

        <!-- Current Page Indicator -->
        <li class="page-item disabled">
          <span class="page-link">{{ eventPage }} / {{ totalEventPages }}</span>
        </li>

        <!-- Next Button -->
        <li class="page-item" :class="{ disabled: eventPage === totalEventPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(eventPage + 1)">Next</a>
        </li>
      </ul>
    </nav>


  </div>
</template>

<style scoped>
.page-link {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-link:hover {
  background-color: #007bff;
  color: white;
}

.page-link:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
}

.page-item.disabled .page-link {
  cursor: not-allowed;
  opacity: 0.65;
}

.page-item.active .page-link {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination {
  font-size: 0.9rem; /* Compact font size */
}

@media (max-width: 576px) {
  .custom-pagination-spacing .page-item {
    margin: 0 5px; /* Adjust the spacing as needed */
  }
}
</style>
