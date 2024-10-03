<template>
  <div class="container">
    <h1>Event Filter</h1>
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

        <div class="col-md-6">
          <button type="submit" class="btn btn-primary">Search</button>
          <button type="button" class="btn btn-secondary ms-5" @click="resetFilters">Refresh</button>
        </div>
      </form>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="row mb-3">
      <!-- Display EventCard if events are found -->
      <div class="col-sm-12" v-if="filteredEvents.length > 0">
        <EventCard :events="filteredEvents" />
      </div>

      <!-- Display message when no events are found -->
      <div class="col-sm-12" v-else>
        <div class="alert alert-warning">No events found with the given criteria.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import EventCard from "@/components/event/EventCard.vue";
import axios from 'axios';
import {API_ROUTES} from "@/apiRoutes.js";

// Define reactive object for form inputs
const filters = ref({
  title: '',
  parkName: '',
  creatorName: '',
  startTS: '',  // Use this to hold the date input (yyyy-MM-dd)
});

const filteredEvents = ref([]);
const allEvents = ref([]);  // Store all events fetched from the backend
const error = ref(null);

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

    // Compare event startTS within the range for the entire day
    const matchesStartTS = filters.value.startTS
        ? (event.startTS >= startOfDay && event.startTS <= endOfDay)
        : true;

    return matchesTitle && matchesPark && matchesCreator && matchesStartTS;
  });

  // Check if no events were found and display error message
  if (filteredEvents.value.length === 0) {
    error.value = "No events found with the given criteria.";
  }
};

// Function to fetch park ID by park name
const fetchParkIdByName = async (parkName) => {
  try {
    const response = await axios.get(API_ROUTES.PARKS);
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
  };
  error.value = null; // Clear any error message
  filteredEvents.value = allEvents.value; // Reset filtered events to show all events
};

// Fetch all events when the component is mounted
fetchFilteredEvents();
</script>

<style scoped>
</style>
