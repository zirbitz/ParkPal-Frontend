<template>
  <div>
    <!-- Loop through the events prop -->
    <div v-for="event in events" :key="event.id" class="card">
      <ul class="list-group list-group-flush">
        <!-- Event Image and Tags -->
        <li class="list-group-item">
          <!-- Event Tags -->
          <span v-if="event?.eventTagNames?.length">
            <span v-for="(tagName, index) in event.eventTagNames" :key="index">
              {{ tagName }}<span v-if="index < event.eventTagNames.length - 1">, </span>
            </span>
          </span>

          <!-- Event Image -->
          <a :href="`events/${event.id}.html`">
            <img :src="event.imageUrl || 'default_image_url.jpg'" :alt="event.title || 'Event image'" />
          </a>
        </li>
      </ul>

      <!-- Event Body Content -->
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

        <!-- List of Joined Users -->
        <ul>
          <li v-for="(userId, index) in event.joinedUserIds || []" :key="index">
            <a :href="`user/${userId}.html`">User {{ index + 1 }}</a>
          </li>
        </ul>

        <a href="#" class="btn btn-primary">Join</a>
        <button v-if="isCreator(event)" @click="editEvent(event.id)" class="btn btn-secondary ms-2">Edit</button>
      </div>

      <!-- Event Creator Image -->
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <a :href="`user/${event.creatorUserId}.html`">
            <img :src="event.userPicture || 'default_user_image.jpg'" alt="User picture" />
          </a>
        </li>
      </ul>

      <!-- Event Tags (Additional) -->
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <h6>Event Tags:</h6>
          <p v-if="event?.eventTagNames?.length">
            <span v-for="(tagName, index) in event.eventTagNames" :key="index">
              {{ tagName }}<span v-if="index < event.eventTagNames.length - 1">, </span>
            </span>
          </p>
          <p v-else>No tags available</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchUserData } from '@/service/authService.js';

// Accept events as a prop
const props = defineProps({
  events: {
    type: Array,
    required: true
  }
});

// Vue Router setup
const router = useRouter();

// Function to navigate to UpdateEvent.vue page
const editEvent = (eventId) => {
  router.push({ name: 'UpdateEvent', params: { eventId } });
};

// Utility function to format event dates
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Reactive property to store the user ID
const userId = ref(null);

// Function to check if the current user is the creator of the event
const isCreator = (event) => {
  return userId.value && String(userId.value) === String(event.creatorUserId);
};

// Fetch user data on component mount
onMounted(async () => {
  try {
    const userData = await fetchUserData();
    if (userData && userData.id) {
      userId.value = userData.id;
      console.log('Logged in userId:', userId.value); // Check if the userId is correct
    } else {
      console.error('Failed to fetch user data or userId is missing.');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}

.card img {
  width: 100%;
  height: auto;
}

.card-body {
  text-align: center;
}

.btn {
  margin-top: 10px;
}

.list-group-item ul {
  padding-left: 20px;
}

.list-group-item ul li {
  list-style-type: none;
}
</style>
