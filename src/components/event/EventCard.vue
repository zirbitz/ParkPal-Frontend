<template>
  <div class="card">
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <span v-if="event?.eventTagNames?.length">
          <span v-for="(tagName, index) in event.eventTagNames" :key="index">
            {{ tagName }}<span v-if="index < event.eventTagNames.length - 1">, </span>
          </span>
        </span>
        <a :href="`events/${event.id}.html`">
          <img class="event-images"
               :src="event.imageUrl || 'path_to_default_event_image.jpg'"
               :alt="event.title || 'Event image'"
               @error="addPlaceholder($event, '/src/assets/images/arial.jpg')"
          />
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
        <!-- Link to the creator's public profile -->
        <a :href="`/userprofile/${event.creatorUserId}`">{{ event.creatorName || 'Unknown' }}</a>
      </p>
      <p class="card-text"><strong>Joined Users:</strong></p>
      <ul class="text-center">
        <!-- Iterate through joined usernames and IDs to create links -->
        <li v-for="(username, index) in event.joinedUserNames || []" :key="username">
          <a :href="`/userprofile/${event.joinedUserIds[index]}`">{{ username }}</a>
        </li>
      </ul>
      <a href="#" class="btn btn-primary text-center" @click.prevent="toggleJoin(event)">
        {{ isUserJoined(event) ? 'Unjoin' : 'Join' }}
      </a>
      <button v-if="isCreator(event)" @click="editEvent(event.id)" class="btn btn-secondary ms-2">Edit</button>
    </div>
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <a :href="`/userprofile/${event.creatorUserId}`">
          <img
              class="creator-image"
              :src="event.userPicture || 'path_to_default_user_image.jpg'"
              alt="User picture"
              @error="addPlaceholder($event, '/src/assets/images/arial.jpg')"
          />
        </a>
      </li>
    </ul>
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
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {fetchUserData} from '@/service/authService.js';
import {useRouter} from "vue-router";
import axios from "axios";
import {API_ROUTES} from "@/apiRoutes.js";

// Accept events as a prop
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

// Vue Router setup
const router = useRouter();

// Function to navigate to EditEvent.vue page
const editEvent = (eventId) => {
  router.push({ name: 'UpdateEvent', params: { eventId } });
};

// Utility function to format event dates
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Define emits
const emit = defineEmits(['updateEvent']);

// Reactive property to store the user ID
const userId = ref(null);

// Function to check if the current user is the creator of the event
const isCreator = (event) => {
  return userId.value && String(userId.value) === String(event.creatorUserId);
};

const isUserJoined = (event) => {
  return event.joinedUserIds?.includes(userId.value);
};

const toggleJoin = async (event, e) => {
  try {
    const isJoining = !isUserJoined(event);
    const updatedJoinedUserIds = isJoining
        ? [...event.joinedUserIds, userId.value]
        : event.joinedUserIds.filter(id => id !== userId.value);

    const response = await axios.post(API_ROUTES.EVENTS_PARTICIPATION(event.id, isJoining)
        , null
        , { withCredentials: true });

    const joinedUserNames = Array.isArray(response.data) ? response.data : [];

    const updatedEvent = {
      ...event,
      joinedUserIds: updatedJoinedUserIds,
      joinedUserNames: joinedUserNames,
    };

    // Update the local event data to reflect the change
    event.joinedUserIds = updatedJoinedUserIds;
    event.joinedUserNames = joinedUserNames;

    console.log('Updated event:', updatedEvent); // Check the updated event data

    // Emit the updateEvent event to the parent component
    emit('updateEvent', updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
  }
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

//const addPlaceholder = (event, placeholderSrc) => {
//  event.target.src = placeholderSrc;
//};
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}

.card img {
  display: flex;
  margin: 0 auto;
  max-width: 100%;
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

/* Responsive images with max and min size */
.event-images {
  height: auto;
  width: 100%;
  max-width: 400px;
  min-width: 200px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.creator-image {
  height: auto;
  width: 50%;
  max-width: 200px;
  min-width: 100px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .event-images {
    max-width: 300px;
    min-width: 150px;
  }

  .creator-image {
    max-width: 150px;
    min-width: 80px;
  }
}

li {
  list-style: none;
}

.user-icon {
  margin-right: 8px;
  width: 24px;
  height: 24px;
}
</style>