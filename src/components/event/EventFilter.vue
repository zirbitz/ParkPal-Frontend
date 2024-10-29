<template>
  <div class="container">
    <h1 class="mt-3">Event Filter</h1>
    <hr>
    <div class="col mb-5">
      <form class="row g-3" @submit="handleSubmit">
        <div class="col-md-6">
          <label for="eventTitle" class="form-label">Event Title</label>
          <input v-model="filters.title" type="text" class="form-control" id="eventTitle" placeholder="Enter event title">
        </div>

        <div class="col-md-6">
          <label for="parkName" class="form-label">Park Name</label>
          <input v-model="filters.parkName" type="text" class="form-control" id="parkName" placeholder="Enter park name">
        </div>

        <div class="col-md-6">
          <label for="creatorName" class="form-label">Created By (Creator Name)</label>
          <input v-model="filters.creatorName" type="text" class="form-control" id="creatorName" placeholder="Enter creator name">
        </div>

        <div class="col-md-6">
          <label for="startTS" class="form-label">Event Start Time</label>
          <input v-model="filters.startTS" type="date" class="form-control" id="startTS">
        </div>

        <div class="col-md-4">
          <label for="eventTag" class="form-label">Event Tag</label>
          <select v-model="filters.selectedTagId" class="form-control" id="eventTag">
            <option value disabled ="">Select a tag</option>
            <option v-for="tag in eventTags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
          </select>
        </div>

        <div class="col-md-6 ms-auto mt-5">
          <button type="submit" class="btn btn-primary">Search</button>
          <button type="button" class="btn btn-secondary ms-5" @click="resetFilters">Refresh</button>
        </div>
      </form>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="container-fluid mb-3">
      <h1 class="text-center mt-3">All Events</h1>
      <hr>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 g-3 mb-5">
        <!-- Display EventCard if events are found -->
        <div v-for="event in paginatedEvents" :key="event.id" class="col d-flex justify-content-center">
          <EventCard :event="event" />
        </div>
      </div>
    </div>


    <!-- Pagination Controls -->
    <nav v-if="totalPages > 1" aria-label="Page navigation">
      <ul class="pagination justify-content-center flex-wrap custom-pagination-spacing">
        <!-- Previous Button -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Previous</a>
        </li>

        <!-- Current Page Indicator -->
        <li class="page-item disabled">
          <span class="page-link">{{ currentPage }} / {{ totalPages }}</span>
        </li>

        <!-- Next Button -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue';
import EventCard from "@/components/event/EventCard.vue";
import axios from 'axios';
import {API_ROUTES} from "@/apiRoutes.js";

// Define reactive object for form inputs
const filters = ref({
  title: '',
  parkName: '',
  creatorName: '',
  startTS: '',
  selectedTagId: '',
});

const filteredEvents = ref([]);
const allEvents = ref([]);
const eventTags = ref([]);
const error = ref(null);

const currentPage = ref(1);
const itemsPerPage = ref(6);

// Adjust eventsPerPage based on screen size
const updateEventsPerPage = () => {
  const width = window.innerWidth;
  if (width < 576) {
    itemsPerPage.value = 1;
  } else if (width < 768) {
    itemsPerPage.value = 2;
  } else {
    itemsPerPage.value = 3;
  }
};
// Function to fetch all events and then filter them on the frontend
const fetchFilteredEvents = async () => {
  try {
    const response = await axios.get(API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS());
    if (Array.isArray(response.data)) {
      allEvents.value = response.data.filter(event => event && event.id);  // Store all fetched events
      await filterEvents();  // Apply the filters after fetching
    } else {
      console.error("Expected an array but got:", response.data);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    error.value = 'Error fetching events.';
  }
};

const fetchEventTags = async () => {
  try {
    const response = await axios.get("http://localhost:8080/event-tags");
    if (Array.isArray(response.data)) {
      eventTags.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching event tags:', error);
  }
};

// Function to filter events based on form inputs
const filterEvents = async () => {
  let parkId = null;
  error.value = null; // Clear previous errors

  if (filters.value.parkName) {
    parkId = await fetchParkIdByName(filters.value.parkName);
    if (!parkId) {
      error.value = `No park found with the name "${filters.value.parkName}"`;
      filteredEvents.value = [];
      return;
    }
  }

  // Create a date range (start of the day to end of the day)
  const startOfDay = `${filters.value.startTS}T00:00:00`;
  const endOfDay = `${filters.value.startTS}T23:59:59`;

  filteredEvents.value = allEvents.value.filter(event => {
    const matchesTitle = filters.value.title ? event.title.toLowerCase().includes(filters.value.title.toLowerCase()) : true;
    const matchesPark = parkId ? event.parkId === parkId : true;
    const matchesCreator = filters.value.creatorName ? event.creatorName.toLowerCase().includes(filters.value.creatorName.toLowerCase()) : true;
    const matchesTag = filters.value.selectedTagId ? event.eventTagsIds.includes(filters.value.selectedTagId) : true;

    // Compare event startTS within the range for the entire day
    const matchesStartTS = filters.value.startTS
        ? (event.startTS >= startOfDay && event.startTS <= endOfDay)
        : true;

    return matchesTitle && matchesPark && matchesCreator && matchesTag && matchesStartTS;
  });

  // Check if no events were found and display error message
  if (filteredEvents.value.length === 0) {
    error.value = "No events found with the given criteria.";
  }

  // Reset current page to 1 after filtering
  currentPage.value = 1;
};

// Function to fetch park ID by park name
const fetchParkIdByName = async (parkName) => {
  try {
    const response = await axios.get(API_ROUTES.PARKS, {withCredentials: true});
    const parks = response.data;
    const park = parks.find(p => p.name.toLowerCase() === parkName.toLowerCase());
    return park ? park.id : null;
  } catch (err) {
    console.error('Error fetching park by name:', err);
    error.value = 'Error fetching park by name.';
    return null;
  }
};

// Function to handle form submission
const handleSubmit = async (event) => {
  event.preventDefault();
  await filterEvents();  // Filter the already fetched events based on the form inputs
};

// Function to reset filters and clear the form fields
const resetFilters = () => {
  filters.value = {
    title: '',
    parkName: '',
    creatorName: '',
    startTS: '',
    selectedTagId: '',
  };
  error.value = null; // Clear any error message
  filteredEvents.value = allEvents.value; // Reset filtered events to show all events
  currentPage.value = 1; // Reset to the first page
};

// Paginated Events
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredEvents.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredEvents.value.length / itemsPerPage.value) || 1);

const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Fetch all events when the component is mounted
onMounted(() => {
  fetchFilteredEvents();
  fetchEventTags();
  updateEventsPerPage();
  window.addEventListener('resize', updateEventsPerPage);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateEventsPerPage);
});
</script>

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
    margin: 0 5px;
  }
}
</style>
