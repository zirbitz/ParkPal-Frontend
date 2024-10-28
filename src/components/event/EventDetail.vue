<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRoute} from "vue-router";
import axios from "axios";
import { API_ROUTES } from "@/apiRoutes.js";
import {fetchUserIdAndRole} from "@/service/authService.js";
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
const map = ref(null);
const parkMarker = ref(null);
const fullAddress = ref('');
const isUserJoined = ref(false);
const isJoining = ref(false);
const isUnjoining = ref(false);
const heartContainer = ref(null);
const joinedUserNames = ref([]);
const joinedUserIds = ref([]);
const joinedUserPictures = ref([]);
const currentPage = ref(1);
const pageSize = 2;

//TODO: add better styling for carousel!
// Function to fetch the event by ID
const fetchEvent = async () => {
  try {
    console.log(eventId.value)
    const response = await axios.get(`http://localhost:8080/events/${eventId.value}`);
    event.value = response.data;
    await fetchCreatorUsername(event.value.creatorUserId);
    await fetchEventImages(event.value.mediaFileExternalIds);
    await fetchParkInfo();
    await fetchEventTags();
  } catch (error) {
    console.error('Error fetching event:', error);
  }
};
const initMap = () => {
  map.value = L.map('map').setView([48.2082, 16.3738], 13); // Default view centered on Vienna

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value);
};

const geocodeAddress = async (park) => {
  const addressString = `${park.address.streetNumber}, ${park.address.zipCode} ${park.address.city}, ${park.address.country.name}`;
  console.log(addressString); // Correctly log the address

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: addressString,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
    });

    console.log('Geocode response:', response.data); // Correctly log the response

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      park.lat = parseFloat(location.lat);
      park.lng = parseFloat(location.lon); // Correct key for longitude
      console.log(`Coordinates found: lat = ${park.lat}, lng = ${park.lng}`);
    } else {
      console.warn(`No coordinates found for park: ${park.name}`);
    }
  } catch (error) {
    console.error(`Error geocoding address for park: ${park.name}`, error);
  }
};


// Function to update the map location based on geocoded lat/lng
const updateMapLocation = () => {
  if (event.value && event.value.lat && event.value.lng) {
    const latLng = [event.value.lat, event.value.lng];

    if (parkMarker.value) {
      parkMarker.value.setLatLng(latLng); // Update the marker's position
    } else {
      parkMarker.value = L.marker(latLng).addTo(map.value); // Add a new marker if it doesn't exist
    }

    map.value.setView(latLng, 15); // Center the map at the new coordinates
  }
};

// Function to check if the user has joined the event
const checkUserJoined = () => {
  return event.value?.joinedUserIds?.includes(userId.value);
};

const fetchJoinedUserProfilePictures = async () => {
  try {
    joinedUserPictures.value = await Promise.all(
        event.value.joinedUserIds.map(async (userId) => {
          try {
            const userResponse = await axios.get(API_ROUTES.USERS_BY_ID(userId));
            const profilePictureId = userResponse.data.profilePictureId;

            if (profilePictureId) {
              // Fetch the profile picture from MinIO using the profilePictureId
              const pictureResponse = await axios.get(`${API_ROUTES.MINIO}/${profilePictureId}`, {
                responseType: 'blob',
              });
              return URL.createObjectURL(pictureResponse.data);
            } else {
              return
            }
          } catch (error) {
            console.error(`Error fetching profile picture for user ${userId}:`, error);
            return
          }
        })
    );
  } catch (error) {
    console.error('Error fetching joined users profile pictures:', error);
  }
};


// Function to toggle join/unjoin event participation
const toggleJoin = async () => {
  try {
    const userCurrentlyJoined = checkUserJoined();

    // Emit heart animation only if joining
    if (!userCurrentlyJoined) {
      emitHeart();
    }

    // Trigger animations for joining/unjoining
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

    // Determine join or unjoin action
    const isJoiningAction = !userCurrentlyJoined;

    // Make API call to join/unjoin event
    await axios.post(API_ROUTES.EVENTS_PARTICIPATION(event.value.id, isJoiningAction), null, {withCredentials: true});

    // Update local join state after the join/unjoin action
    event.value.joinedUserIds = isJoiningAction
        ? [...event.value.joinedUserIds, userId.value]
        : event.value.joinedUserIds.filter(id => id !== userId.value);

    // Refresh join state to reflect the change
    isUserJoined.value = checkUserJoined();

    // Fetch updated joined users and their profile pictures
    await fetchJoinedUsers();

  } catch (error) {
    console.error('Error updating event:', error);
  }
};

const formatDate = (date) => {
  const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
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
// Function to fetch joined users
const fetchJoinedUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/events/${event.value.id}`, {withCredentials: true});
    joinedUserNames.value = response.data.joinedUserNames || [];
    joinedUserIds.value = response.data.joinedUserIds || [];
    await fetchJoinedUserProfilePictures();
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

    await geocodeAddress(parkData); // Fetch the coordinates from the address

    // After geocoding, update event's lat/lng from parkData
    event.value.lat = parkData.lat;
    event.value.lng = parkData.lng;

    if (event.value.lat && event.value.lng) {
      updateMapLocation();
    }
  } catch (error) {
    console.error('Error fetching park information', error);
  }
};

const paginatedJoinedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return joinedUserNames.value.slice(start, end);
});

// Total pages based on joined users length
const totalPages = computed(() => {
  return Math.ceil(joinedUserNames.value.length / pageSize);
});

// Function to go to the previous page
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Function to go to the next page
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// Fetch event tags based on tag IDs
const fetchEventTags = async () => {
  try {
    const tagIds = event.value.eventTagsIds || [];
    const tagNames = await Promise.all(
        tagIds.map(async (tagId) => {
          const response = await axios.get(`http://localhost:8080/event-tags/${tagId}`, {withCredentials: true});
          console.log(response.data.name)
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

    const profilePictureId = response.data.profilePictureId;

    if (profilePictureId) {
      // Fetch the profile picture from MinIO using the profilePictureId
      try {
        const pictureResponse = await axios.get(`${API_ROUTES.MINIO}/${profilePictureId}`, {
          responseType: 'blob',
          withCredentials: true,
        });
        creatorImageUrl.value = URL.createObjectURL(pictureResponse.data);
      } catch (error) {
        console.error(`Error fetching profile picture for creator ${creatorUserId}:`, error);// Use placeholder if there's an error
      }
    } else {
      // Use placeholder if no profile picture is available
    }
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
              const response = await axios.get(`${API_ROUTES.MINIO}/${fileId}`, {
                responseType: 'blob',
                withCredentials: true
              });
              if (response.data.size > 0) {
                return URL.createObjectURL(response.data);
              }
            } catch (error) {
              console.error(`Error fetching image for fileId ${fileId}:`, error);

            }
          })
      );
      eventImageUrls.value = imageUrls;
    } else {
      return
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

  // Fetch user ID if available
  const userData = await fetchUserIdAndRole();
  if (userData && userData.id) {
    userId.value = userData.id;
  }

  // Fetch event data first
  await fetchEvent();

  // Set the initial join state once the event data is available
  isUserJoined.value = checkUserJoined();
  await fetchJoinedUsers();
  await fetchJoinedUserProfilePictures();

  // Initialize the map
  initMap();

  // Fetch park info and update map location after geocoding
  await fetchParkInfo();
  updateMapLocation();

});

</script>

<template>
  <div class="container" v-if="event">
    <!-- Event Banner -->
    <div class="event-content">
      <section class="event-info">
        <div class="event-header">
          <h2 class="event-title mt-3">{{ event.title || 'No title available' }}</h2>
        </div>

        <section class="tags">
          <div v-if="eventTagNames?.length" class="event-tags">
            <span v-for="(tagName, index) in eventTagNames" :key="index" class="badge">{{ tagName }}</span>
          </div>
        </section>

        <section class="times">
          <div class="time-item">
            <span class="time-icon">🕒</span>
            <p><strong>Start:</strong> {{ formatDate(event.startTS) }}</p>
          </div>
          <div class="time-item">
            <span class="time-icon">⏰</span>
            <p><strong>End:</strong> {{ formatDate(event.endTS) }}</p>
          </div>
        </section>

        <section class="event-img mt-3">
          <div v-if="eventImageUrls.length > 0" class="carousel-container" :style="{ height: 300 + 'px' }">
            <button v-if="eventImageUrls.length > 1" class="carousel-btn prev" @click="prevSlide">❮</button>
            <img :src="eventImageUrls[currentSlide]" alt="Event Image" class="carousel-image" />
            <button v-if="eventImageUrls.length > 1" class="carousel-btn next" @click="nextSlide">❯</button>
          </div>
        </section>


        <div class="event-description">
          <p>{{ event.description || 'No description available' }}</p>
        </div>


        <section class="creator-info">
          <router-link :to="{ name: 'PublicUserProfile', params: { userId: event.creatorUserId } }" class="user-link">
            <h4 class="me-5">created by:</h4>
            <img
                v-if="creatorImageUrl"
                :src="creatorImageUrl"
                :alt="creatorUsername + '\'s Profile Picture'"
                class="profile-picture"
            />
            <img
                v-else
                src="/src/assets/images/default-profile.png"
                alt="Default Profile Picture"
                class="profile-picture"
            />
            <h4 class="username">{{ creatorUsername }}</h4>
          </router-link>
        </section>


        <!-- Joined Users Section -->
        <section class="joined-users">
          <h3>Joined Users</h3>
          <div class="user-list">
            <div v-for="(username, index) in paginatedJoinedUsers" :key="joinedUserIds[index]" class="user-card">
              <router-link :to="{ name: 'PublicUserProfile', params: { userId: joinedUserIds[index] } }"
                           class="user-card-link">
                <img
                    v-if="joinedUserPictures && joinedUserPictures[(currentPage - 1) * pageSize + index]"
                    :src="joinedUserPictures[(currentPage - 1) * pageSize + index]"
                    :alt="username + '\'s Profile Picture'"
                    class="profile-picture"
                />
                <img
                    v-else
                    src="/src/assets/images/default-profile.png"
                    alt="Default Profile Picture"
                    class="profile-picture"
                />
                <div class="username">{{ username }}</div>
              </router-link>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination-controls">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
        </section>
      </section>

      <!-- Event Map Section -->
      <section class="event-map">
        <h3 class="park-name">
          Park:
          <router-link :to="{ name: 'ParksOverview' }">{{ parkName }}</router-link>
        </h3>
        <p class="address-info">{{ fullAddress }}</p>
        <div id="map" style="height: 300px; width: 100%;"></div>
      </section>
    </div>
    <!-- Join Event Button -->
    <div class="join-section mb-3">
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

.carousel-container {
  position: relative;
  width: 100%;
  max-width: 800px; /* Define max width */
  overflow: hidden;
  border-radius: 10px; /* Rounded corners */
  margin: 0 auto; /* Center alignment */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow for depth */
}

.carousel-slide {
  display: flex;
  transition: transform 0.5s ease; /* Smooth transition for sliding */
}

.slide {
  flex: 1 0 100%; /* Each slide takes full width */
  display: flex;
  justify-content: center;
  align-items: center;
}

.event-images {
  width: 100%;
  height: 400px;
  object-fit: cover; /* Maintain aspect ratio and crop to fit */
  border-radius: 10px;
}

/* Navigation Buttons */
.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  z-index: 10;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

.prev:hover, .next:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* Carousel Image Container */
.carousel-image {
  border-radius: 10px;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.event-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.event-info {
  flex: 1;
  min-width: 300px;
}

.event-map {
  flex: 1;
  min-width: 300px;
}

.joined-users, .join-section {
  margin-top: 20px;
}

.event-tags {
  margin-bottom: 15px;
}

.badge {
  font-size: 1.1rem;
  font-weight: bolder;
  margin-right: 2rem;
  background: white;
  color: #B00101;
  border: 2px solid #B00101;
  border-radius: 15px;
}

.event-description {
  margin-bottom: 20px;
  font-size: 1.1rem;

}

.creator-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9; /* Light background color */
  border-radius: 10px; /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin-bottom: 20px;
}

.creator-info h4 {
  margin: 0 10px 0 0;
}

.creator-info .profile-picture {
  width: 60px; /* Larger profile picture */
  height: 60px;
  border-radius: 50%; /* Make it circular */
  object-fit: cover; /* Ensure image covers the entire area */
  margin-right: 15px; /* Space between the picture and the username */
  border: 2px solid #ddd; /* Border for the profile picture */
}

.user-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.creator-info .username {
  font-size: 1.1em;
  font-weight: bold;
  color: #B00101;
  text-decoration: none;
}

.creator-info:hover {
  background-color: #eaeaea; /* Slight background change on hover */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15); /* Increase shadow on hover */
  transition: all 0.3s ease-in-out;
}

.creator-info a {
  color: inherit; /* Keep the text color unchanged */
}


.joined-users {
  padding: 15px;
  background-color: #f9f9f9; /* Light background color */
  border-radius: 10px; /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin-bottom: 20px;
}

.joined-users h3 {
  font-size: 1.2em;
  color: #333;
  margin-bottom: 15px;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: center; /* Center content horizontally */
  padding: 10px;
  background-color: #fff; /* White background for each user card */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
  text-align: center; /* Center-align text inside */
  transition: background-color 0.3s, box-shadow 0.3s;
}

.user-card:hover {
  background-color: #eaeaea; /* Slight background change on hover */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15); /* Increase shadow on hover */
}

.user-card .profile-picture {
  width: 50px; /* Profile picture size */
  height: 50px;
  border-radius: 50%; /* Circular image */
  object-fit: cover; /* Image fills the circle */
  margin-right: 10px; /* Spacing between image and text */
  border: 2px solid #ddd; /* Light border */
}

.user-card .username {
  font-size: 1em;
  font-weight: bold;
  color: #B00101; /* Text color similar to creator's username */
  text-decoration: none;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}

.pagination-controls button {
  padding: 8px 12px;
  background-color: #B00101;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-controls button:hover {
  background-color: #8b0101; /* Darker shade on hover */
}

.pagination-controls span {
  margin: 0 10px;
  font-size: 0.9em;
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

.event-map {
  margin-top: 20px;
  margin-bottom: 20px;
}

.address-info {
  font-size: 1rem;
  font-style: oblique;
}

.user-card {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  text-align: center;
  width: 150px; /* Set width for user cards */
}

.user-card-link {
  text-decoration: none; /* Remove underline from links */
  color: inherit; /* Inherit color from parent */
  display: block; /* Make the entire card clickable */
}

.profile-picture {
  width: 100px; /* Set specific size */
  height: 100px; /* Set specific size */
  border-radius: 50%; /* Make the profile picture circular */
  object-fit: cover; /* Ensures the image is cropped to fit within the circle */
}

.username {
  margin-top: 10px;
  font-weight: bold;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
}

button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  cursor: pointer;
}

button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
  color: black;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.times {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
  font-family: Arial, sans-serif;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between icon and text */
}

.time-icon {
  font-size: 1.4em;
  color: #B00101; /* Blue color for icons to match the theme */
}

.times p {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}

.times strong {
  color: #B00101; /* Consistent blue accent color */
}

@media (max-width: 600px) {
  .times {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-item {
    margin-bottom: 10px;
  }
}

.event-description {
  background-color: #f9f9f9; /* Light background similar to the times section */
  padding: 20px;
  border-left: 4px solid #B00101; /* Blue accent border to match the theme */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  font-family: Arial, sans-serif;
  margin-top: 20px;
}

.event-description p {
  margin: 0;
  font-size: 1em;
  line-height: 1.6;
  color: #333;
}

.event-description p::first-letter {
  font-size: 1.3em;
  font-weight: bold;
  color: #B00101; /* First letter color to match accent */
}

@media (max-width: 600px) {
  .event-description {
    padding: 15px;
  }
}
</style>