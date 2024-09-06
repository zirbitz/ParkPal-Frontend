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
// Import the `isAuthenticated` and `isAdmin` functions
import {isAuthenticated, isAdmin} from '@/service/authService.js'; // Replace with actual path to your `auth.js` file

// Helper function to delete a cookie
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default {
  computed: {
    isAuthenticated() {
      return isAuthenticated();  // Returns whether the user is authenticated
    },
    isAdmin() {
      return isAdmin();  // Returns whether the user has admin privileges
    }
  },
  methods: {
    logout() {
      // Check if the user is authenticated before logging out
      if (this.isAuthenticated) {
        console.log("Logging out, deleting JWT token.");

        // Delete the JWT token cookie
        deleteCookie('token');
        // After logout, redirect to the login page
        //TODO: replace this maybe later with vuex
        window.location.href = '/'

      } else {
        console.log("User is already logged out or not authenticated.");
      }
    }
  }
};
</script>
