<template>
  <div>
    <h4>Our Most Active Users</h4>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div class="user-list">
      <div
          v-for="user in paginatedUsers"
          :key="user.id"
          class="user-card"
      >
        <!-- Wrap the card content in a router-link to navigate to the public profile -->
        <router-link
            :to="{ name: 'PublicUserProfile', params: { userId: user.id } }"
            class="user-card-link"
        >
          <!-- Display the user profile picture if available -->
          <img
              v-if="user.profilePictureUrl"
              :src="user.profilePictureUrl"
              :alt="user ? user.userName + '\'s Profile Picture' : 'Profile Picture'"
              class="profile-picture"
          />
          <!-- Otherwise, display the placeholder image -->
          <img
              v-else
              src="/src/assets/images/default-profile.png"
              alt="Default Profile Picture"
              class="profile-picture"
          />
          <div class="username">{{ user.userName }}</div>
        </router-link>
      </div>
      <div class="pagination-controls text-center">
        <button class="btn-primary" @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button class="btn-tertiary" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { API_ROUTES } from '@/apiRoutes.js';

const users = ref([]);         // Array to hold all users
const loading = ref(true);      // Loading state
const error = ref(null);        // Error state
const currentPage = ref(1);     // Current page number
const pageSize = 2;            // Number of users per page

// Function to fetch users
async function fetchUsers() {
  try {
    const response = await axios.get(API_ROUTES.USERS);
    const fetchedUsers = response.data;

    // Fetch profile pictures for each user
    for (const user of fetchedUsers) {
      user.profilePictureUrl = await fetchUserProfilePicture(user.profilePictureId);
    }

    users.value = fetchedUsers;
  } catch (err) {
    error.value = 'Failed to fetch users: ' + err.message;
  } finally {
    loading.value = false;
  }
}

// Function to fetch user profile picture
async function fetchUserProfilePicture(profilePictureId) {
  if (!profilePictureId) return null;

  try {
    const pictureResponse = await axios.get(`${API_ROUTES.MINIO}/${profilePictureId}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(pictureResponse.data);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return null;
  }
}

// Computed property for paginated users
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return users.value.slice(start, end);
});

// Total pages computed based on users length
const totalPages = computed(() => {
  return Math.ceil(users.value.length / pageSize);
});

// Go to the previous page
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Go to the next page
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// Fetch users on component mount
onMounted(fetchUsers);
</script>


<style scoped>
.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
  width: 100px;   /* Set specific size */
  height: 100px;  /* Set specific size */
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
</style>
