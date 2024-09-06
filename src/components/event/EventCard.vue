<template>
  <div>
    <div v-for="event in events" :key="event.id" class="card">
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <span v-if="event.eventTagNames.length > 0">
            <span v-for="(tagName, index) in event.eventTagNames" :key="index">
              {{ tagName }}<span v-if="index < event.eventTagNames.length - 1">, </span>
            </span>
          </span>
          <a :href="`events/${event.id}.html`">
            <img :src="event.imageUrl || 'default_image_url.jpg'" :alt="event.title" />
          </a>
        </li>
      </ul>
      <div class="card-body">
        <h5 class="card-title">{{ event.title }}</h5>
        <h6 class="card-text">
          <a :href="`park/${event.parkId}.html`">Park</a> <!-- Link to park page -->
        </h6>
        <p class="card-text">{{ event.description }}</p>
        <p class="card-text"><strong>Start:</strong> {{ formatDate(event.startTS) }}</p>
        <p class="card-text"><strong>End:</strong> {{ formatDate(event.endTS) }}</p>
        <p class="card-text"><strong>Creator:</strong> <a :href="`user/${event.creatorUserId}.html`">{{ event.creatorName }}</a></p>
        <p class="card-text"><strong>Joined Users:</strong></p>
        <ul>
          <li v-for="(userId, index) in event.joinedUserIds" :key="index">
            <a :href="`user/${userId}.html`">User {{ index + 1 }}</a>
          </li>
        </ul>
        <a href="#" class="btn btn-primary">Join</a>
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <a :href="`user/${event.creatorUserId}.html`"><img :src="event.userPicture || 'default_user_image.jpg'" alt="userpicture" /></a> <!-- Link to creator profile -->
        </li>
      </ul>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <h6>Event Tags:</h6>
          <p v-if="event.eventTagNames.length > 0">
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
import axios from 'axios';

// Accept events as a prop
defineProps({
  events: {
    type: Array,
    required: true
  }
});

// Utility function to format the event dates
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

// Fetch additional information using Axios if needed
const fetchAdditionalData = async (eventId) => {
  try {
    const response = await axios.get(`/api/events/${eventId}`);
    // Process the response data
  } catch (error) {
    console.error('Error fetching additional data:', error);
  }
};
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
