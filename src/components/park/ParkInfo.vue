<script setup>
import { ref, computed, watch } from 'vue';
import EventCard from "@/components/event/EventCard.vue";

// Define props
const props = defineProps({
  title: String,
  description: String,
  address: {
    type: Object,
    default: () => ({}),
  },
  events: {
    type: Array,
    default: () => [],
  },
});

// State for toggling details view
const showDetails = ref(false);

// Utility function to format address
const formatAddress = (address) => {
  if (!address) return 'No address available';
  const { streetNumber, city, zipCode, country } = address;
  const countryName = country && country.name ? country.name : 'Unknown Country';
  return `${streetNumber || ''}, ${zipCode || ''} ${city || ''}, ${countryName}`;
};

// Utility function to format date
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Pagination state
const itemsPerPage = 1;
const currentPage = ref(1);

// Watch for changes in events prop
watch(
    () => props.events,
    (newEvents) => {
      currentPage.value = 1; // Reset to first page when new events arrive
    }
);

// Computed properties for pagination
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.events.slice(start, end);
});

const totalPages = computed(() => Math.ceil(props.events.length / itemsPerPage));

// Pagination controls
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Toggle show details
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>



<template>
  <div class="park-section">
    <h2 class="park-title">{{ title }}</h2>
    <p class="park-description">{{ description }}</p>

    <button @click="toggleDetails" class="toggle-button">
      <span v-if="showDetails">Hide Details &#x25B2;</span>
      <span v-else>Show Details &#x25BC;</span>
    </button>

    <transition name="fade">
      <div v-if="showDetails" class="details-section">
        <p class="address">Address: {{ formatAddress(address) }}</p>

        <div v-if="events.length" class="events">
          <h4>Upcoming Events:</h4>
          <div class="event-card-grid">
            <EventCard
                v-for="(event, index) in paginatedEvents"
                :key="event.id"
                :event="event"
                class="small-event-card"
            />
          </div>

          <!-- Pagination Controls -->
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">&#x2190;</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">&#x2192;</button>
          </div>
        </div>
        <div v-else>
          <p>No upcoming events</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.park-section {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.event-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Centers content when fewer items are in the grid */
  gap: 15px;
  justify-items: center; /* Center the card within the grid */
}



.park-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.park-description {
  font-size: 1rem;
  color: #666;
}

.toggle-button {
  background-color: #b00101;
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
  transition: background-color 0.3s ease, transform 0.3s;
}

.toggle-button:hover {
  background-color: #8a0001;
  transform: scale(1.05);
}

.details-section {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

.address {
  margin-bottom: 1rem;
  font-weight: bold;
  color: #333;
}

.events {
  margin-top: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.pagination button {
  background-color: #b00101;
  color: #fff;
  border: none;
  padding: 6px 12px;
  margin: 0 5px;
  border-radius: 5px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 0.85rem;
  color: #333;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>




