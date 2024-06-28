<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const submitForm = () => {
  // Handle form submission logic here
  console.log(`Email: ${email.value}, Password: ${password.value}`);
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
                <input type="email" class="form-control" id="email" placeholder="abc@example.com" v-model="email" aria-describedby="emailHelp">
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
                  Submit
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
/* Add your scoped styles here */
</style>
