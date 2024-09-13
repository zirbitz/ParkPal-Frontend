<script setup>
import { format } from 'date-fns';
import {computed} from "vue";

// Define the props with type validation
const props = defineProps({
  title: String,
  address: {
    type: Object,
    default: () => ({})
  },
  events: Array,
});

// Function to format the date-time in a more readable way
const formatEventDateTime = (dateTime) => {
  if (!dateTime) return 'No time provided';
  return format(new Date(dateTime), 'PPP p'); // e.g., 'Sep 12, 2024 at 1:00 PM'
};

// Function to format the address
const formatAddress = (address) => {
  if (!address) return 'No address available';
  const { streetNumber, city, zipCode, country } = address;
  const countryName = country && country.name ? country.name : 'Unknown Country';
  return `${streetNumber || ''}, ${zipCode || ''} ${city || ''}, ${countryName}`;
};

const upcomingEvents = computed(() => props.events.slice(0, 2));
</script>

<template>
  <div class="small-card card" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-text">Address: {{ formatAddress(address) }}</p>

      <div v-if="upcomingEvents.length">
        <h6>Upcoming Events:</h6>
        <ul>
          <li v-for="event in upcomingEvents" :key="event.id">
            <strong>{{ event.title }}</strong><br />
            <small>{{ formatEventDateTime(event.startTS) }} - {{ formatEventDateTime(event.endTS) }}</small>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No upcoming events</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.small-card {
  margin-bottom: 20px;
}
</style>
