<script setup>

</script>

<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <router-link :to="{ name:'Home' }" class="navbar-brand">
        <router-link class="navbar-brand" :to="{ name:'Home' }">
          <img id="LogoParkpal" src="../assets/icons/Parkpal_Logo.svg" alt="Park Pal Logo">
          Park Pal
        </router-link>
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link :to="{name: 'Home'}" class="nav-link active" aria-current="page">Home</router-link>
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
          <li class="nav-item">
            <router-link :to="{name:'AdminDashboard'}" class="nav-link">Admin</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Login
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><router-link :to="{ name: 'Login' }" class="dropdown-item">Login</router-link></li>
              <li><router-link :to="{ name: 'Register' }" class="dropdown-item">Register</router-link></li>
            </ul>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'UserDashboard' }" class="nav-link">
              <img class="rounded-circle" src="../assets/images/arial.jpg" alt="Profile Picture" width="40" height="40">
              <span>User Profile</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  align-content: end;
  img.rounded-circle {
    border-radius: 50%;
  }
}
</style>