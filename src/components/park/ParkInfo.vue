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
</script>


<template>
  <div class="park-section">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <p>Address: {{ formatAddress(address) }}</p>

    <div v-if="events.length">
      <h4>Upcoming Events:</h4>

      <!-- Loop through the paginated events -->
      <div v-for="event in paginatedEvents" :key="event.id" class="card">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <!-- Check if eventTagNames exists and has a length -->
            <span v-if="event?.eventTagNames && event.eventTagNames.length > 0">
              <span v-for="(tagName, index) in event.eventTagNames" :key="index">
                {{ tagName }}<span v-if="index < event.eventTagNames.length - 1">, </span>
              </span>
            </span>
            <a :href="`events/${event.id}.html`">
              <img :src="event.imageUrl || 'default_image_url.jpg'" :alt="event.title || 'Event image'" />
            </a>
          </li>
        </ul>
        <div class="card-body">
          <h5 class="card-title">{{ event.title || 'No title available' }}</h5>
          <h6 class="card-text">
            <a :href="`park/${event.parkId}.html`">Park</a>
          </h6>
          <p class="card-text">{{ event.description || 'No description available' }}</p>
          <p class="card-text"><strong>Start:</strong> {{ formatDate(event.startTS) }}</p>
          <p class="card-text"><strong>End:</strong> {{ formatDate(event.endTS) }}</p>
          <p class="card-text"><strong>Creator:</strong>
            <a :href="`user/${event.creatorUserId}.html`">{{ event.creatorName || 'Unknown' }}</a>
          </p>
          <p class="card-text"><strong>Joined Users:</strong></p>
          <ul>
            <li v-for="(userId, index) in event.joinedUserIds || []" :key="index">
              <a :href="`user/${userId}.html`">User {{ index + 1 }}</a>
            </li>
          </ul>
          <a href="#" class="btn btn-primary">Join</a>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <a :href="`user/${event.creatorUserId}.html`">
              <img :src="event.userPicture || 'default_user_image.jpg'" alt="User picture" />
            </a>
          </li>
        </ul>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <h6>Event Tags:</h6>
            <p v-if="event?.eventTagNames && event.eventTagNames.length > 0">
              <span v-for="(tagName, index) in event.eventTagNames" :key="index">
                {{ tagName }}<span v-if="index < event.eventTagNames.length - 1">, </span>
              </span>
            </p>
            <p v-else>No tags available</p>
          </li>
        </ul>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">
          &#x2190;
        </button>

        <span>Page {{ currentPage }} of {{ totalPages }}</span>

        <button @click="nextPage" :disabled="currentPage === totalPages">
          &#x2192;
        </button>
      </div>
    </div>
    <div v-else>
      <p>No upcoming events</p>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: none;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background-color: #0056b3;
}

.pagination span {
  font-size: 16px;
  margin: 0 10px;
}

.pagination button:focus {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.pagination button:active {
  background-color: #0056b3;
}

.card{
  transform: scale(0.75);
  transform-origin: center;
}
</style>

