<template>
  <nav class="navbar navbar-expand-md" v-if="authStatus">
    <div class="container">
      <router-link :to="{ name:'Home' }" class="navbar-brand">
        <img id="LogoParkpal" src="../assets/icons/Parkpal_Logo.svg" alt="Park Pal Logo">
        <span class="navbar-brand-text">Park Pal</span>
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link :to="{name: 'Home'}" class="nav-link">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{name:'ParksOverview'}" class="nav-link">Parks</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
               aria-expanded="false">
              Events
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link :to="{ name: 'EventOverview'}" class="dropdown-item">Overview</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'EventFilter'}" class="dropdown-item">Filter Events</router-link>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <router-link :to="{ name: 'CreateEvent' }" class="dropdown-item">Create Event</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item" v-if="authStatus.isAdmin">
            <router-link :to="{name:'AdminDashboard'}" class="nav-link">Admin</router-link>
          </li>
          <li class="nav-item" v-if="authStatus.isAuthenticated">
            <button @click="showLogoutSection" class="nav-link btn btn-link">
              Logout
            </button>
            <div v-if="showLogoutInfo" class="confirmation-box">
              <div class="confirmation-content">
                <div class="action-buttons">
                  <button @click="handleLogout" class="btn btn-danger mb-3">
                    <i class="fas fa-sign-out-alt"></i> Confirm Logout
                  </button>
                </div>
              </div>
            </div>
          </li>

          <li class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Login
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><router-link :to="{ name: 'Login' }" class="dropdown-item">Login</router-link></li>
              <li><router-link :to="{ name: 'Register' }" class="dropdown-item">Register</router-link></li>
            </ul>
          </li>

          <li class="nav-item" v-if="authStatus.isAuthenticated">
            <router-link :to="{ name: 'UserDashboard' }" class="nav-link">
              <img
                  v-if="profilePictureUrl"
                  class="rounded-circle"
                  :src="profilePictureUrl"
                  :alt="user ? user.userName + '\'s Profile Picture' : 'Profile Picture'"
                  width="40"
                  height="40"
              />
              <span class="user-name-text">User Profile</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { API_ROUTES } from '@/apiRoutes.js';
import { useStore } from "vuex";
import router from "@/router.js";

// Track auth status and profile picture URL
const store = useStore();
const profilePictureUrl = ref(null);
const user = ref(null);
const showLogoutInfo = ref(false); // Control the visibility of the confirmation box
const authStatus = store.state;

// Function to fetch user data by userId
async function fetchUserById(userId) {
  try {
    const response = await axios.get(API_ROUTES.USERS_BY_ID(userId));
    return response.data; // Assuming the response contains the user data (UserDto)
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Function to fetch auth status and user details
async function fetchAuthStatus() {
  await store.dispatch('checkAuth');
  console.log('Auth status:', store.state.isAuthenticated);

  if (authStatus.isAuthenticated) {
    console.log('User is authenticated');
    try {
      const userId = store.state.userId;

      if (userId) {
        const fullUserData = await fetchUserById(userId);
        user.value = fullUserData;

        if (fullUserData && fullUserData.profilePictureId) {
          const pictureResponse = await axios.get(`${API_ROUTES.MINIO}/${fullUserData.profilePictureId}`, {
            responseType: 'blob',
          });
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          profilePictureUrl.value = imageUrl;
        } else {
          profilePictureUrl.value = '/src/assets/images/default-profile.png';
        }
      }
    } catch (error) {
      console.error('Error fetching user or profile picture:', error);
      profilePictureUrl.value = require('@/assets/images/default-profile.png');
    }
  }
}

// Hook to call the fetchAuthStatus function when the component is mounted
onMounted(() => {
  fetchAuthStatus();

  // Listen for profilePictureUpdated event
  window.addEventListener('profilePictureUpdated', (event) => {
    profilePictureUrl.value = event.detail;
  });
});

// Watch for changes in the authentication state
watch(() => store.state.isAuthenticated, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchAuthStatus();
  }
});

// Logout Functions
async function handleLogout() {
  try {
    await store.dispatch('logout'); // Perform logout action
    await fetchAuthStatus(); // Update auth status after logout
    await router.push("/login")
  } catch (error) {
    console.error('Error during logout:', error);
  }
  closeLogoutSection(); // Close confirmation box
}

function showLogoutSection() {
  showLogoutInfo.value = true; // Show the confirmation box
}

function closeLogoutSection() {
  showLogoutInfo.value = false; // Hide the confirmation box
}
</script>

<style scoped>
.navbar {
  background-color: #B00101;
  .nav-link {
    color: white;
    font-size: 18px;
  }
  .nav-link.router-link-active {
    color: white;
    font-weight: 600;
  }
}

.navbar .navbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.navbar-brand-text {
  color: white;
  margin-left: 24px;
}

.navbar-toggler {
  color: white;
  border: 1px solid white;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath stroke='rgba(255, 255, 255, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

@media (min-width: 992px) {
  .navbar-toggler {
    display: none;
  }

  .navbar-collapse {
    display: flex !important;
  }

  .navbar-brand-text {
    font-size: 24px;
    margin-left: 16px;
  }

  .nav-link {
    font-size: 20px;
  }

  .user-name-text {
    margin-left: 12px;
    font-size: 20px;
  }
}

@media (max-width: 992px) {
  .user-name-text {
    display:none;
  }

  .rounded-circle{
    height: 2rem;
    width: 2rem;
  }
}

@media (max-width: 768px) {
  .user-name-text {
    display: inline;
    font-size: 20px;
    font-weight: 400;
    margin-left: 12px;
  }

  .rounded-circle{
    height: 4rem;
    width: 4rem;
  }
}
</style>
