<template>
  <div class="card" :style="{ color: textColor, maxWidth: cardWidth }">
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <p v-if="eventTagNames?.length">
      <span class="badge" v-for="(tagName, index) in eventTagNames" :key="index">
        {{ tagName }}<span v-if="index < eventTagNames.length - 1"></span>
      </span>
        </p>
        <p v-else></p>
        <div class="carousel-container">
          <!-- Render the images -->
          <div class="carousel-slide" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <img
                v-for="(url, index) in eventImageUrls"
                :key="index"
                class="event-images"
                :src="url"
                :alt="url === placeholderImage ? 'Placeholder-Image: A Icon showing 4 friends in a circle to symbolize an Event' : truncateDescription(event.description)"

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
        <router-link :to="`/parkoverview/`">{{ parkName }}</router-link>
        <p>{{ fullAddress }}</p>
      </h6>
      <p class="card-text">{{ event.description || 'No description available' }}</p>
      <p class="card-text"><strong>Start:</strong> {{ formatDate(event.startTS) }}</p>
      <p class="card-text"><strong>End:</strong> {{ formatDate(event.endTS) }}</p>
      <p class="card-text"><strong>Creator: </strong>
        <a :href="`/userprofile/${event.creatorUserId}`">{{ creatorUsername }}</a>
      </p>
      <p class="card-text"><strong>Joined Users:</strong></p>
      <ul class="text-center">
        <li v-for="(username, index) in event.joinedUserNames || []" :key="username">
          <a :href="`/userprofile/${event.joinedUserIds[index]}`">{{ username }}</a>
        </li>
      </ul>
      <div style="position: relative;">
        <div class="heart-container" ref="heartContainer"></div>
        <a
            href="#"
            class="btn btn-join text-center"
            @click.prevent="toggleJoin"
            :class="{ 'join-animation': isJoining, 'unjoin-animation': isUnjoining, 'joined': isUserJoined }"
        >
          {{ isUserJoined ? 'Joined' : 'Join Event' }}
        </a>
      </div>
    </div>
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
  },
  cardWidth: { type: String, default: '100%' },
  imageMaxWidth: { type: String, default: '400px' },
  textColor: { type: String, default: '#000' },
  primaryColor: { type: String, default: '#B00101' }
});

// Vue Router setup
const router = useRouter();

// Define emits
const emit = defineEmits(['updateEvent']);

// Reactive properties to store user ID, creator's username, and image URLs
const userId = ref(null);
const creatorUsername = ref('Unknown');
const eventImageUrls = ref([]);
const creatorImageUrl = ref(null);
const currentSlide = ref(0);
const eventTagNames = ref([]);
const parkName = ref('');
const fullAddress = ref('')

// Animation states
const isUserJoined = ref(false); // Initial state
const isJoining = ref(false);
const isUnjoining = ref(false);
const heartContainer = ref(null);


// Function to check if the user has joined the event
const checkUserJoined = () => {
  return props.event.joinedUserIds?.includes(userId.value);
};

const toggleJoin = async () => {
  try {
    const userCurrentlyJoined = checkUserJoined();

    if (!userCurrentlyJoined) {
      emitHeart(); // Emit hearts only when joining
    }
    // Trigger animation
    if (userCurrentlyJoined) {
      isUnjoining.value = true;
      setTimeout(() => {
        isUnjoining.value = false;
      }, 600); // Duration of the CSS animation
    } else {
      isJoining.value = true;
      setTimeout(() => {
        isJoining.value = false;
      }, 600);
    }

    // Determine join or unjoin action
    const isJoiningAction = !userCurrentlyJoined;
    const updatedJoinedUserIds = isJoiningAction
        ? [...props.event.joinedUserIds, userId.value]
        : props.event.joinedUserIds.filter(id => id !== userId.value);

    const response = await axios.post(API_ROUTES.EVENTS_PARTICIPATION(props.event.id, isJoiningAction), null, { withCredentials: true });

    const joinedUserNames = Array.isArray(response.data) ? response.data : [];

    const updatedEvent = {
      ...props.event,
      joinedUserIds: updatedJoinedUserIds,
      joinedUserNames: joinedUserNames,
    };

    props.event.joinedUserIds = updatedJoinedUserIds;
    props.event.joinedUserNames = joinedUserNames;

    // Update the isUserJoined state
    isUserJoined.value = checkUserJoined();

    // Emit the updated event
    emit('updateEvent', updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
  }
};

// Fetch joined users
const fetchJoinedUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/events/${props.event.id}`);
    const joinedUserNames = response.data.joinedUserNames || [];
    const joinedUserIds = response.data.joinedUserIds || [];
    props.event.joinedUserNames = joinedUserNames;
    props.event.joinedUserIds = joinedUserIds;
    isUserJoined.value = checkUserJoined(); // Set initial join state
  } catch (error) {
    console.error('Error fetching joined users:', error);
  }
};

const fetchParkInfo = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/parks/${props.event.parkId}`);
    const parkData = response.data;

    parkName.value = parkData.name;  // Assign parkName
    const parkAddress = parkData.address;

    // Assign full address to fullAddress reactive property
    fullAddress.value = `${parkAddress.streetNumber}, ${parkAddress.zipCode} ${parkAddress.city}, ${parkAddress.country.name}`;

    console.log(`Park Name: ${parkName.value}`);
    console.log(`Park Address: ${fullAddress.value}`);
  } catch (error) {
    console.error('Error fetching park information', error);
  }
};

// Utility function to format event dates
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

const truncateDescription = (description) => {
  if (!description) return ''; // Handle cases where description is empty or undefined
  const words = description.split(' '); // Split the description into words
  return words.slice(0, 6).join(' '); // Get the first 4 words and join them back into a string
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % eventImageUrls.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + eventImageUrls.value.length) % eventImageUrls.value.length;
};

import placeholderImage from '/src/assets/images/people.png';
// Function to fetch the event images
const fetchEventImages = async (mediaFileIds) => {
  try {
    // Check if mediaFileIds is valid and contains at least one ID
    if (mediaFileIds && mediaFileIds.length > 0) {
      const imageUrls = await Promise.all(
          mediaFileIds.map(async (fileId) => {
            try {
              const response = await axios.get(`${API_ROUTES.MINIO}/${fileId}`, {
                responseType: 'blob',
                withCredentials: true,
              });

              // Check if the response contains valid image data
              if (response.data.size > 0) {
                return URL.createObjectURL(response.data);
              } else {
                return placeholderImage;
              }
            } catch (error) {
              // Log the error and return the placeholder image in case of failure
              console.error(`Error fetching image for fileId ${fileId}:`, error);
              return placeholderImage;
            }
          })
      );

      eventImageUrls.value = imageUrls;
    } else {
      // If mediaFileIds is empty or not provided, set the placeholder image
      eventImageUrls.value = [placeholderImage];
    }
  } catch (error) {
    console.error('Error fetching event images:', error);
    // Set all image URLs to the placeholder in case of a global failure
    eventImageUrls.value = Array(mediaFileIds.length || 1).fill(placeholderImage);
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


// Function to check if the current user is the creator of the event
const isCreator = (event) => {
  return userId.value && String(userId.value) === String(event.creatorUserId);
};

// Function to create heart animations
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
    await fetchParkInfo();
    await fetchEventTags();
  } catch (error) {
    console.error('Error initializing component:', error);
  }
});
</script>

<style scoped>
.card {
  margin-bottom: 10px;
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
:root {
  --card-padding: 16px;
  --card-max-width: 100%;
  --card-background: white;
  --text-color: #000;
  --primary-color: #B00101;
  --secondary-color: #28a745;
  --badge-color: #B00101;
  --badge-bg-color: white;
  --image-max-width: 400;
}

.card {
  padding: var(--card-padding);
  background: var(--card-background);
  color: var(--text-color);
  max-width: var(--card-max-width);
  margin-bottom: 10px;
}
.btn {
  margin-top: 10px;
}

@media (max-width: 768px) {
  .card {
    padding: 8px;
  }

  .event-images {
    max-width: 100%;
    min-width: 150px;
  }

  .btn-join {
    padding-left: 1.5em;
    padding-right: 1em;
  }
}

.card {
  max-width: 100%; /* Use dynamic max-width from props */
}

.event-images {
  width: 100%;
  max-width: var(--image-max-width, 400px); /* fallback to default if not set */
}

.card-title {
  font-size: 1.5rem; /* Can scale with the root font size */
}

.event-images {
  max-width: calc(100% - 2rem); /* A flexible size that adapts to the available space */
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

/* Initial button styles */
.btn-join {
  transition: background-color 1s ease, transform 1s ease, color 1s ease;
  position: relative;
  overflow: hidden;
  padding-left: 2.5em; /* Space for icon */
  padding-right: 1.5em;
  display: inline-flex;
  align-items: center;
  color: white;
  background:  #B00101;
  border-radius: 25px;
}

/* Icon styles */
.btn-join::before {
  content: '\002B'; /* Plus icon (default) */
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  margin-right: 0.5em;
  transition: transform 1s ease, opacity 1s ease;
  position: absolute;
  left: 1em;
}

/* Change icon to checkmark when joined */
.joined::before {
  content: '\2713'; /* Checkmark icon */
}

/* Permanent color change when joined */
.joined {
  background-color: #28a745; /* Green color */
  color: white;
}

/* Animation for "Join" button */
.join-animation {
  animation: joinEffect 1s ease forwards;
}

/* Animation for "Unjoin" button */
.unjoin-animation {
  animation: unjoinEffect 1s ease forwards;
}

/* Keyframes for join animation */
@keyframes joinEffect {
  0% {
    background-color: #916b32;
    transform: scale(1);
  }
  50% {
    background-color: #3cea64;
    transform: scale(1.1);
  }
  100% {
    background-color: #13912e;
    transform: scale(1);
  }
}

/* Keyframes for unjoin animation */
@keyframes unjoinEffect {
  0% {
    background-color: #28a745;
    transform: scale(1);
  }
  50% {
    background-color: #eab401;
    transform: scale(1.1);
  }
  100% {
    background-color: #B00101;
    transform: scale(1);
  }
}

heart-container {
   position: absolute;
   top: -20px; /* Position above the button */
   left: 50%;
   transform: translateX(-50%);
   pointer-events: none;
   width: 100%;
 }

.heart-container {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  width: 100%;
  height: 100px; /* Ensure some height for the container */
  z-index: 10;
}

.heart {
  position: absolute;
  width: 1em;
  height: 1em;
  background-color: red;
  transform: rotate(45deg);
  animation: floatUp 1s ease forwards, fadeOut 1s ease forwards;
  opacity: 0.8;
  pointer-events: none;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(45deg);
  }
  100% {
    transform: translateY(-50px) rotate(45deg); /* Adjust floating distance */
  }
}

@keyframes fadeOut {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-2em) scale(1.5); }
}

@keyframes fadeOut {
  0% { opacity: 0.8; }
  100% { opacity: 0; }
}

.badge {
  font-size: 1.25rem;
  font-weight: bolder;
  margin-right: 2rem;
  background: white;
  color: #B00101;
  border: 2px solid #B00101;
  border-radius: 15px;
}
</style>
