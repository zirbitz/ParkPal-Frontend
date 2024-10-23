<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from "vue-router";
import axios from "axios";
import { API_ROUTES } from "@/apiRoutes.js";
import placeholderImage from '/src/assets/images/people.png';
import {fetchUserIdAndRole} from "@/service/authService.js";

// Reactive properties to store the event data, user ID, creator's username, and image URLs
const event = ref(null);
const eventId = ref(null);
const userId = ref(null);
const creatorUsername = ref('Unknown');
const eventImageUrls = ref([]);
const creatorImageUrl = ref(null);
const currentSlide = ref(0);
const eventTagNames = ref([]);
const parkName = ref('');
const fullAddress = ref('');
const isUserJoined = ref(false);
const isJoining = ref(false);
const isUnjoining = ref(false);
const heartContainer = ref(null);


// Function to fetch the event by ID
const fetchEvent = async () => {
  try {
    console.log(eventId.value)
    const response = await axios.get(`http://localhost:8080/events/${eventId.value}`);
    event.value = response.data;
    await fetchCreatorUsername(event.value.creatorUserId);
    await fetchJoinedUsers();
    await fetchEventImages(event.value.mediaFileExternalIds);
    await fetchParkInfo();
    await fetchEventTags();
  } catch (error) {
    console.error('Error fetching event:', error);
  }
};

// Function to check if the user has joined the event
const checkUserJoined = () => {
  return event.value?.joinedUserIds?.includes(userId.value);
};

// Function to toggle join/unjoin event participation
const toggleJoin = async () => {
  try {
    const userCurrentlyJoined = checkUserJoined();

    if (!userCurrentlyJoined) {
      emitHeart(); // Emit hearts only when joining
    }

    if (userCurrentlyJoined) {
      isUnjoining.value = true;
      setTimeout(() => {
        isUnjoining.value = false;
      }, 600);
    } else {
      isJoining.value = true;
      setTimeout(() => {
        isJoining.value = false;
      }, 600);
    }

    const isJoiningAction = !userCurrentlyJoined;
    const updatedJoinedUserIds = isJoiningAction
        ? [...event.value.joinedUserIds, userId.value]
        : event.value.joinedUserIds.filter(id => id !== userId.value);

    const response = await axios.post(API_ROUTES.EVENTS_PARTICIPATION(event.value.id, isJoiningAction), null, { withCredentials: true });

    const joinedUserNames = Array.isArray(response.data) ? response.data : [];

    event.value.joinedUserIds = updatedJoinedUserIds;
    event.value.joinedUserNames = joinedUserNames;

    isUserJoined.value = checkUserJoined();
  } catch (error) {
    console.error('Error updating event:', error);
  }
};
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};
// Function to fetch joined users
const fetchJoinedUsers = async () => {
  try {
    const response = await axios.get(`${API_ROUTES.EVENTS}/${event.value.id}`);
    const joinedUserNames = response.data.joinedUserNames || [];
    const joinedUserIds = response.data.joinedUserIds || [];
    event.value.joinedUserNames = joinedUserNames;
    event.value.joinedUserIds = joinedUserIds;
    isUserJoined.value = checkUserJoined();
  } catch (error) {
    console.error('Error fetching joined users:', error);
  }
};

// Fetch park information based on the event's parkId
const fetchParkInfo = async () => {
  try {
    const response = await axios.get(`${API_ROUTES.PARKS}/${event.value.parkId}`);
    const parkData = response.data;

    parkName.value = parkData.name;
    const parkAddress = parkData.address;

    fullAddress.value = `${parkAddress.streetNumber}, ${parkAddress.zipCode} ${parkAddress.city}, ${parkAddress.country.name}`;
  } catch (error) {
    console.error('Error fetching park information', error);
  }
};

// Fetch event tags based on tag IDs
const fetchEventTags = async () => {
  try {
    const tagIds = event.value.eventTagsIds || [];
    const tagNames = await Promise.all(
        tagIds.map(async (tagId) => {
          const response = await axios.get(`${API_ROUTES.EVENT_TAGS}/${tagId}`);
          return response.data.name;
        })
    );
    eventTagNames.value = tagNames;
  } catch (error) {
    console.error('Error fetching event tags:', error);
  }
};

// Function to fetch the creator's username
const fetchCreatorUsername = async (creatorUserId) => {
  try {
    const response = await axios.get(API_ROUTES.USERS_BY_ID(creatorUserId));
    creatorUsername.value = response.data.userName;
    creatorImageUrl.value = response.data.profilePicture || null;
  } catch (error) {
    console.error('Error fetching creator username:', error);
  }
};

// Function to fetch event images
const fetchEventImages = async (mediaFileIds) => {
  try {
    if (mediaFileIds && mediaFileIds.length > 0) {
      const imageUrls = await Promise.all(
          mediaFileIds.map(async (fileId) => {
            try {
              const response = await axios.get(`${API_ROUTES.MINIO}/${fileId}`, { responseType: 'blob', withCredentials: true });
              if (response.data.size > 0) {
                return URL.createObjectURL(response.data);
              } else {
                return placeholderImage;
              }
            } catch (error) {
              console.error(`Error fetching image for fileId ${fileId}:`, error);
              return placeholderImage;
            }
          })
      );
      eventImageUrls.value = imageUrls;
    } else {
      eventImageUrls.value = [placeholderImage];
    }
  } catch (error) {
    console.error('Error fetching event images:', error);
    eventImageUrls.value = Array(mediaFileIds.length || 1).fill(placeholderImage);
  }
};

// Emit hearts when joining the event
const emitHeart = () => {
  const heartEl = document.createElement('div');
  heartEl.classList.add('heart');
  heartEl.style.left = `${Math.random() * 100}%`;
  heartEl.style.width = `${0.8 + Math.random() * 0.6}em`;
  heartEl.style.height = `${0.8 + Math.random() * 0.6}em`;

  heartContainer.value.appendChild(heartEl);

  setTimeout(() => {
    if (heartEl.parentElement) {
      heartContainer.value.removeChild(heartEl);
    }
  }, 1000);
};

const route = useRoute();
onMounted(async () => {
  eventId.value = route.params.eventId;
  const userData = await fetchUserIdAndRole();
  if (userData && userData.id) {
    userId.value = userData.id;
  }
  await fetchEvent();
});
</script>

<template>
  <div class="container" v-if="event">
    <!-- Event Banner -->
    <section class="banner">
      <div class="carousel-container">
        <div class="carousel-slide" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="(url, index) in eventImageUrls" :key="index" class="slide">
            <img
                class="event-images"
                :src="url"
                :alt="url === placeholderImage ? 'Placeholder Image' : truncateDescription(event.description)"
            />
          </div>
        </div>
        <!-- Carousel controls -->
        <button v-if="eventImageUrls.length > 1" class="prev" @click="prevSlide">❮</button>
        <button v-if="eventImageUrls.length > 1" class="next" @click="nextSlide">❯</button>
      </div>
    </section>

    <!-- Event Information Section -->
    <section class="event-info">
      <div class="event-header">
        <h1 class="event-title">{{ event.title || 'No title available' }}</h1>
        <p class="park-name">
          Hosted at:
          <router-link :to="{ name: 'ParksOverview' }">{{ parkName }}</router-link>
        </p>
        <p>{{ fullAddress }}</p>
      </div>

      <!-- Tags -->
      <div v-if="eventTagNames?.length" class="event-tags">
        <span v-for="(tagName, index) in eventTagNames" :key="index" class="badge">{{ tagName }}</span>
      </div>

      <!-- Event Description -->
      <div class="event-description">
        <p>{{ event.description || 'No description available' }}</p>
        <p><strong>Start:</strong> {{ formatDate(event.startTS) }}</p>
        <p><strong>End:</strong> {{ formatDate(event.endTS) }}</p>
      </div>

      <!-- Creator Info -->
      <div class="creator-info">
        <p><strong>Creator:</strong>
          <a :href="`/userprofile/${event.creatorUserId}`">{{ creatorUsername }}</a>
        </p>
      </div>
    </section>

    <!-- Joined Users Section -->
    <section class="joined-users">
      <h3>Joined Users</h3>
      <ul>
        <li v-for="(username, index) in event.joinedUserNames || []" :key="username">
          <a :href="`/userprofile/${event.joinedUserIds[index]}`">{{ username }}</a>
        </li>
      </ul>
    </section>

    <!-- Join Event Button -->
    <div class="join-section">
      <div class="heart-container" ref="heartContainer"></div>
      <a
          href="#"
          class="btn btn-join"
          @click.prevent="toggleJoin"
          :class="{ 'join-animation': isJoining, 'unjoin-animation': isUnjoining, 'joined': isUserJoined }"
      >
        {{ isUserJoined ? 'Joined' : 'Join Event' }}
      </a>
    </div>
  </div>
  <div v-else>
    <p>Loading event details...</p>
  </div>
</template>

<style scoped>
.container {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.banner {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  margin-bottom: 30px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.slide img {
  width: 100%;
  height: auto;
}

.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

.event-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
}

.event-header {
  margin-bottom: 20px;
}

.event-title {
  font-size: 3rem;
  margin-bottom: 10px;
}

.park-name {
  font-size: 2em;
}

.event-tags {
  margin-bottom: 15px;
}

.badge {
  background-color: #f0f0f0;
  margin-right: 5px;
  padding: 5px;
  font-size: 0.9rem;
  border-radius: 5px;
}

.event-description {
  margin-bottom: 20px;
}

.creator-info {
  margin-bottom: 20px;
}

.joined-users {
  margin-bottom: 30px;
}

.join-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.btn-join {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  font-size: 1.2rem;
  border-radius: 5px;
}

.btn-join.joined {
  background-color: #dc3545;
}
</style>