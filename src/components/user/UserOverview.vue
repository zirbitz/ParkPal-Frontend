<template>
  <div>
    <h4>Our Most Active Users</h4>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div class="user-list">
      <div
          v-for="user in users"
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
              alt="User Profile Picture"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_ROUTES } from '@/apiRoutes.js'; // Ensure this file has the correct routes

const users = ref([]);        // Array to hold users data
const loading = ref(true);     // Loading state
const error = ref(null);       // Error state

// Function to fetch all users
async function fetchUsers() {
  try {
    const response = await axios.get(API_ROUTES.USERS, { withCredentials: true });
    const fetchedUsers = response.data;

    // Fetch profile pictures for each user
    for (const user of fetchedUsers) {
      user.profilePictureUrl = await fetchUserProfilePicture(user.profilePictureId);
    }

    users.value = fetchedUsers; // Store the fetched users with their picture URLs
  } catch (err) {
    error.value = 'Failed to fetch users: ' + err.message;
  } finally {
    loading.value = false; // Set loading to false when request is done
  }
}

// Function to fetch the user profile picture
async function fetchUserProfilePicture(profilePictureId) {
  if (!profilePictureId) return null; // No profile picture available

  try {
    const pictureResponse = await axios.get(`${API_ROUTES.MINIO}/${profilePictureId}`, {
      responseType: 'blob',
      withCredentials: true,
    });

    // Create a URL for the profile picture blob
    return URL.createObjectURL(pictureResponse.data);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return null; // Return null in case of error
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
</style>
