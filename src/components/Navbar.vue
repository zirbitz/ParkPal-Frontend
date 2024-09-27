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
            <router-link :to="{ name: 'Logout' }" class="nav-link">Logout</router-link>
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
              <img class="rounded-circle" src="../assets/images/arial.jpg" alt="Profile Picture" width="40" height="40">
              <span class="user-name-text">User Profile</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { isAuthenticated, isAdmin } from '@/service/authService';


const authStatus = ref({
  isAuthenticated: false,
  isAdmin: false
});

async function fetchAuthStatus() {
  authStatus.value.isAuthenticated = await isAuthenticated();
  if (authStatus.value.isAuthenticated) {
    authStatus.value.isAdmin = await isAdmin();
  }
}

onMounted(() => {
  fetchAuthStatus();
});
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

