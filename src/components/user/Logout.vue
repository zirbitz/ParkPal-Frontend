<template>
  <div class="container">
    <div class="row text-center">
      <div class="col-4 col-md-6 col-sm-8 mt-5 mb-3">
        <button @click="logout" class="btn btn-primary">
          Logout
          <span class="icon"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { isAdmin, isAuthenticated } from "@/service/authService.js";

export default {
  computed: {
    isAuthenticated() {
      return isAuthenticated();
    },
    isAdmin() {
      return isAdmin();
    }
  },
  methods: {
    async logout() {
      if (this.isAuthenticated) {
        try {
          console.log("Logging out, sending request to backend.");

          // Send request to backend to handle server-side logout
          await axios.post(
              'http://localhost:8080/auth/logout',
              {},
              { withCredentials: true } // Ensures that cookies (e.g., JWT token) are sent automatically
          );

          // Clear the client-side storage (localStorage/sessionStorage) if needed
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          // Optionally clear the cookie manually (not necessary if the backend handles it)
          document.cookie = "token=; Max-Age=0; path=/";

          // Redirect to the login page after logout
          window.location.href = '/login'; // Change to your actual login page
        } catch (error) {
          console.error('Error during logout:', error);
        }
      } else {
        console.log("User is already logged out or not authenticated.");
      }
    }
  }
};
</script>