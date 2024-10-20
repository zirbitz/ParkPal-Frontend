<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { API_ROUTES } from "@/apiRoutes.js";
import EventCard from "@/components/event/EventCard.vue";

// Public Profile Data
const user = ref(null);
const userId = ref(null);
const firstName = ref('');
const lastName = ref('');
const username = ref('');
const country = ref('');
const profilePictureUrl = ref(''); // Store profile picture URL

// Events Data
const events = ref([]);
const eventPage = ref(1);
const eventsPerPage = ref(2);

// Computed property for pagination
const totalEventPages = computed(() => Math.ceil(events.value.length / eventsPerPage.value));
const paginatedEvents = computed(() => {
  const start = (eventPage.value - 1) * eventsPerPage.value;
  return events.value.slice(start, start + eventsPerPage.value);
});

// Fetch user data for public view
const fetchPublicUserProfileAndEvents = async () => {
  try {
    // Fetch the user's public profile data based on their ID
    const userResponse = await axios.get(API_ROUTES.USERS_BY_ID(userId.value));
    const userData = userResponse.data;

    if (userData) {
      user.value = userData;
      firstName.value = userData.firstName;
      lastName.value = userData.lastName;
      username.value = userData.userName;

      // Fetch country details using the countryId
      if (userData.countryId) {
        const countryResponse = await axios.get(`${API_ROUTES.COUNTRIES}/${userData.countryId}`);
        country.value = countryResponse.data.name;
      }

      // Fetch profile picture
      if (userData.profilePictureId) {
        const profilePictureResponse = await axios.get(API_ROUTES.FILES_BY_EXTERNAL_ID(userData.profilePictureId), {
          responseType: 'blob',
        });
        profilePictureUrl.value = URL.createObjectURL(profilePictureResponse.data);
      }

      // Fetch the user's events
      const eventsResponse = await axios.get(API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS(userData.id));
      if (eventsResponse && eventsResponse.data && Array.isArray(eventsResponse.data)) {
        events.value = eventsResponse.data;
      } else {
        console.error("No events found or unexpected format.");
      }
    }
  } catch (error) {
    console.error('Failed to fetch public user profile, country, or events data:', error);
  }
};


// Pagination functions
const prevEventPage = () => {
  if (eventPage.value > 1) eventPage.value--;
};
const nextEventPage = () => {
  if (eventPage.value < totalEventPages.value) eventPage.value++;
};
const goToEventPage = (page) => {
  eventPage.value = page;
};

// Set userId from route parameters and fetch data on component mount
const route = useRoute();
onMounted(() => {
  userId.value = route.params.userId; // Set userId from route params
  fetchPublicUserProfileAndEvents();
});
</script>

<template>
  <div class="container">
    <h1>{{ firstName }} {{ lastName }}'s Profile</h1>
    <hr>
    <div v-if="user">
      <div class="row">
        <div class="col-12 col-md-6">
          <div v-if="profilePictureUrl">
            <img :src="profilePictureUrl" alt="Profile Picture" class="img-thumbnail" width="150">
          </div>
          <h2>{{ username }}</h2>
          <p>Country: {{ country }}</p>
        </div>
      </div>
    </div>

    <div class="card mt-5 mb-2">
      <div class="card-body">
        <h2>{{ firstName }}'s Events</h2>
        <div v-if="events.length > 0" class="row row-cols-1 row-cols-md-2 g-4 mt-2">
          <!-- Changed `:events="[event]"` to `:event="event"` -->
          <div v-for="(event, index) in paginatedEvents" :key="event.id" class="event-card col">
            <EventCard :event="event" />
          </div>
        </div>
        <nav v-if="events.length > 0" aria-label="Event page navigation">
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
        <div v-else>
          <p>No events found.</p>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.container {
  max-width: 800px;
  margin: auto;
}
</style>
