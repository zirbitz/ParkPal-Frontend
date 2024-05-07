<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');

const submitForm = () => {
  // Handle form submission logic here
  // it
  console.log(`Email: ${email.value}, Password: ${password.value}`);
};

</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <h1 class="text-center mb-4">Login</h1>
        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" v-model="email" aria-describedby="emailHelp">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password">
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        <div class="mt-3">
          <router-link to="/register">Don't have an account? Register here</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>