<template>
  <router-link
      :to="{ name: 'EventDetail', params: { eventId: event.id } }"
      class=""
  >
    <div class="card-container">
      <div class="card" :style="{ color: textColor, maxWidth: cardWidth }">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <p v-if="eventTagNames?.length">
          <span class="badge" v-for="(tagName, index) in eventTagNames" :key="index">
            {{ tagName }}<span v-if="index < eventTagNames.length - 1"></span>
          </span>
            </p>
            <p v-else></p>

            <!-- Carousel container -->
            <div class="carousel-container">
              <!-- Image carousel -->
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
          </li>
        </ul>

        <div class="card-body">
          <!-- Event details -->
          <h5 class="card-title">{{ event.title || 'No title available' }}</h5>
          <h6 class="card-text">
            <router-link :to="{name: 'ParksOverview'}">{{ parkName }}</router-link>
            <p>{{ fullAddress }}</p>
          </h6>
          <p class="card-text">{{ event.description || 'No description available' }}</p>
          <p class="card-text"><strong>Start:</strong> {{ formatDate(event.startTS) }}</p>
          <p class="card-text"><strong>End:</strong> {{ formatDate(event.endTS) }}</p>
          <p class="card-text"><strong>Creator: </strong>
            <a :href="`/userprofile/${event.creatorUserId}`">{{ creatorUsername }}</a>
          </p>

          <!-- Joined users list -->
          <p class="card-text"><strong>Joined Users:</strong></p>
          <ul class="text-center">
            <li class="user-list-item" v-for="(username, index) in event.joinedUserNames || []" :key="username">
              <a :href="`/userprofile/${event.joinedUserIds[index]}`">{{ username }}</a>
            </li>
          </ul>

          <!-- Join event button -->
          <div class="text-center">
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
      </div>
    </div>
  </router-link>

</template>

<script setup>
import {onMounted, ref} from 'vue';
import {fetchUserIdAndRole} from '@/service/authService.js';
import {useRouter} from "vue-router";
import axios from "axios";
import {API_ROUTES} from "@/apiRoutes.js";
import placeholderImage from '/src/assets/images/people.png';

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
              })

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
    const userData = await fetchUserIdAndRole();
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
.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.card {
  width: 100%;
  max-width: 300px; /* Default for larger screens */
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: max-width 0.3s ease-in-out;
}

.card-body {
  font-size: 1rem;
}

/* Image carousel */
.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;
  padding: 10px;
}

.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px; /* You can adjust this based on your desired max card size */
  height: 100%;
  max-height: 700px; /* Adjust as needed */
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background-color: #fff;
}


.card-body {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  overflow: hidden;
}

.card-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Handles long titles */
}

.card-text {
  font-size: 0.9rem;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 5; /* Limit to 5 lines by default */
  -webkit-box-orient: vertical;
}

.card-text.long-text {
  font-size: 0.7rem; /* Resizes for longer content */
}

.card-text.short-text {
  font-size: 0.9rem; /* Normal size */
}

/* Ensure no font size exceeds 11px on smaller cards */
@media (max-width: 400px) {
  .card-text {
    font-size: 0.7rem; /* 11px for small screens */
  }
}

/* Overflow handling */
.card-text {
  display: -webkit-box;
  line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.carousel-container {
  position: relative;
  width: 100%; /* Ensure the container takes full width */
  overflow: hidden; /* Hide the overflow of slides */
}

/* Carousel slides */
.carousel-slide {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
  max-height: 200px;
}

.slide {
  flex: 0 0 100%; /* Each slide takes up 100% of the container width */
  max-width: 100%;
  max-height: 200px;
}

.event-images {
  width: 100%; /* Ensure images take up the full width of their container */
  height: auto; /* Maintain aspect ratio */
  object-fit: cover;
  max-height: 200px;
}

/* Carousel controls */
.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0 10px;
  cursor: pointer;
  z-index: 10;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}




.user-list-item {
  list-style: none;
  padding-left: 30px;
  padding-right: 12px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tIUZvbnQgQXdlc29tZSBGcmVlIDYuNi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZD0iTTIyNCAyNTZBMTI4IDEyOCAwIDEgMCAyMjQgMGExMjggMTI4IDAgMSAwIDAgMjU2em0tNDUuNyA0OEM3OS44IDMwNCAwIDM4My44IDAgNDgyLjNDMCA0OTguNyAxMy4zIDUxMiAyOS43IDUxMmwzODguNiAwYzE2LjQgMCAyOS43LTEzLjMgMjkuNy0yOS43QzQ0OCAzODMuOCAzNjguMiAzMDQgMjY5LjcgMzA0bC05MS40IDB6Ii8+PC9zdmc+');
  background-repeat: no-repeat;
  background-size: 16px 16px;
  background-position: 0 50%;
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
