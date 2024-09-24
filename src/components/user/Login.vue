<script>
import axios from 'axios';
import EventOverView from "@/components/event/EventOverView.vue";
import {isAdmin, isAuthenticated} from "@/service/authService.js";

export default {
  components: { EventOverView },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    // Helper function to set cookies
    setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },
    async submitForm() {
      const loginData = {
        username: this.email,
        password: this.password
      };

      try {
        const response = await axios.post('http://localhost:8080/auth/login', loginData, {
          withCredentials: true
        });

        await isAdmin();
        await isAuthenticated();
        window.location.href = '/eventOverview'

        console.log('Login successful:', response.data);
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        // Optionally show an error message to the user
      }
    }
  }
};
</script>


<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card mb-5 login-card">
          <div class="card-body">
            <div class="card-logo">
              <img id="LogoParkpal" src="/src/assets/icons/Parkpal_Logo.svg" alt="Park Pal Logo">
            </div>
            <h1 class="text-center mb-4">Sign In</h1>
            <p class="login-info-text">Login to Create and Join Events</p>
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <input type="text" class="form-control" id="email" placeholder="abc@example.com" v-model="email" aria-describedby="emailHelp">
              </div>
              <div class="mb-3">
                <div class="input-group">
                  <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      placeholder="Your password"
                      v-model="password"
                  >
                  <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="togglePasswordVisibility"
                  >
                    <span v-if="showPassword">
                      <i class="bi bi-eye-slash"></i>
                    </span>
                    <span v-else>
                      <i class="bi bi-eye"></i>
                    </span>
                  </button>
                </div>
              </div>
              <div class="text-center">
                <router-link to="" aria-label="Link directs to Password-Recovery">Forgot your Password?</router-link>
              </div>
              <div class="mt-3 text-center">
                <button type="submit" class="btn btn-primary">
                  Log in
                  <span class="icon"></span>
                </button>
              </div>
            </form>
            <div class="mt-3 text-center">
              <div class="mt-3 text-center">
                <router-link to="/register" class="btn btn-secondary" aria-label="Register for an account">
                  Register
                  <span class="icon"></span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>