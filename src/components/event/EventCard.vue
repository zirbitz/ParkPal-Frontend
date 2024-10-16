<template>
  <div class="card">
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <p v-if="eventTagNames?.length">
      <span class="badge text-bg-primary" v-for="(tagName, index) in eventTagNames" :key="index">
        {{ tagName }}<span v-if="index < eventTagNames.length - 1">, </span>
      </span>
        </p>
        <p v-else>No tags available</p>
        <div class="carousel-container">
          <!-- Render the images -->
          <div class="carousel-slide" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <img
                v-for="(url, index) in eventImageUrls"
                :key="index"
                class="event-images"
                :src="url"
                :alt="event.title || 'Event image'"
                @error="addPlaceholder($event, '/src/assets/images/arial.jpg')"
            />
          </div>

          <!-- Carousel controls -->
          <button v-if="eventImageUrls.length > 1" class="prev" @click="prevSlide">❮</button>
          <button v-if="eventImageUrls.length > 1" class="next" @click="nextSlide">❯</button>
        </div>
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
        <a :href="`/userprofile/${event.creatorUserId}`">{{ creatorUsername }}</a>
      </p>
      <p class="card-text"><strong>Joined Users:</strong></p>
      <ul class="text-center">
        <li v-for="(username, index) in event.joinedUserNames || []" :key="username">
          <a :href="`/userprofile/${event.joinedUserIds[index]}`">{{ username }}</a>
        </li>
      </ul>
      <a href="#" class="btn btn-primary text-center" @click.prevent="toggleJoin(event)">
        {{ isUserJoined(event) ? 'Unjoin' : 'Join' }}
      </a>
    </div>
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <a :href="`/userprofile/${event.creatorUserId}`">
          <img
              class="creator-image"
              :src="creatorImageUrl || 'path_to_default_user_image.jpg'"
              alt="User picture"
              @error="addPlaceholder($event, '/src/assets/images/arial.jpg')"
          />
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { fetchUserData } from '@/service/authService.js';
import { useRouter } from "vue-router";
import axios from "axios";
import { API_ROUTES } from "@/apiRoutes.js";

// Accept event as a prop
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

// Vue Router setup
const router = useRouter();

// Utility function to format event dates
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Define emits
const emit = defineEmits(['updateEvent']);

// Reactive properties to store user ID, creator's username, and image URLs
const userId = ref(null);
const creatorUsername = ref('Unknown');
const eventImageUrls = ref([]);
const creatorImageUrl = ref(null);
const currentSlide = ref(0);
const eventTagNames = ref([]); // New state for event tag names


const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % eventImageUrls.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + eventImageUrls.value.length) % eventImageUrls.value.length;
};
// Function to fetch the event tags
const fetchEventTags = async () => {
  try {
    const tagIds = props.event.eventTagsIds || [];
    const tagNames = await Promise.all(
        tagIds.map(async (tagId) => {
          const response = await axios.get(`http://localhost:8080/event-tags/${tagId}`);
          return response.data.name; // Return tag name
        })
    );
    eventTagNames.value = tagNames; // Set tag names
  } catch (error) {
    console.error('Error fetching event tags:', error);
  }
};

// Function to fetch the creator's username
const fetchCreatorUsername = async (creatorUserId) => {
  try {
    const response = await axios.get(API_ROUTES.USERS_BY_ID(creatorUserId));
    creatorUsername.value = response.data.userName;
    creatorImageUrl.value = response.data.userPicture || null;
  } catch (error) {
    console.error('Error fetching creator username:', error);
  }
};

// Function to fetch event media files
const fetchEventImages = async (mediaFileIds) => {
  try {
    if (mediaFileIds && mediaFileIds.length > 0) {
      const imageUrls = await Promise.all(
          mediaFileIds.map(async (fileId) => {
            const response = await axios.get(`${API_ROUTES.MINIO}/${fileId}`, {
              responseType: 'blob',
              withCredentials: true,
            });
            return URL.createObjectURL(response.data); // Return the object URL for each image
          })
      );

      eventImageUrls.value = imageUrls; // Set all URLs
    }
  } catch (error) {
    console.error('Error fetching event images:', error);
  }
};

// Function to check if the current user is the creator of the event
const isCreator = (event) => {
  return userId.value && String(userId.value) === String(event.creatorUserId);
};

// Function to check if the user has joined the event
const isUserJoined = (event) => {
  return event.joinedUserIds?.includes(userId.value);
};

// Fetch joined users
const fetchJoinedUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/events/${props.event.id}`);
    const joinedUserNames = response.data.joinedUserNames || [];
    const joinedUserIds = response.data.joinedUserIds || [];
    event.joinedUserNames = joinedUserNames;
    event.joinedUserIds = joinedUserIds;
  } catch (error) {
    console.error('Error fetching joined users:', error);
  }
};

// Function to join or unjoin an event
const toggleJoin = async (event) => {
  try {
    const isJoining = !isUserJoined(event);
    const updatedJoinedUserIds = isJoining
        ? [...event.joinedUserIds, userId.value]
        : event.joinedUserIds.filter(id => id !== userId.value);

    const response = await axios.post(API_ROUTES.EVENTS_PARTICIPATION(event.id, isJoining), null, { withCredentials: true });

    const joinedUserNames = Array.isArray(response.data) ? response.data : [];

    const updatedEvent = {
      ...event,
      joinedUserIds: updatedJoinedUserIds,
      joinedUserNames: joinedUserNames,
    };

    event.joinedUserIds = updatedJoinedUserIds;
    event.joinedUserNames = joinedUserNames;

    emit('updateEvent', updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
  }
};

// Fetch user data, creator username, joined users, and event media files on component mount
onMounted(async () => {
  try {
    const userData = await fetchUserData();
    if (userData && userData.id) {
      userId.value = userData.id;
    } else {
      console.error('Failed to fetch user data or userId is missing.');
    }

    await fetchCreatorUsername(props.event.creatorUserId);
    await fetchJoinedUsers();
    await fetchEventImages(props.event.mediaFileExternalIds);
    await fetchEventTags();
  } catch (error) {
    console.error('Error initializing component:', error);
  }
});
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

.carousel-container {
  position: relative;
  overflow: hidden;
  width: 100%; /* Make sure it's full width */
}

.carousel-slide {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.event-images {
  flex-shrink: 0;
  width: 100%; /* Adjust the width to make sure only one image is visible */
}

.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 100;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}


/* Responsive images */
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
