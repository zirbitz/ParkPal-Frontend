<script setup></script>

<script>
import CountryService from "@/service/countryService.js";
import axios from "axios";
import {fetchUserData} from "@/service/authService.js";

export default {
  data() {
    return {
      // Profile and Authentication Data
      user: null,
      userid: null,
      genderOptions: ['FEMALE', 'MALE', 'OTHER'],
      firstName: '',
      lastName: '',
      firstNameValid: false,
      lastNameValid: false,
      firstNameDirty: false,
      lastNameDirty: false,
      salutation: '',
      gender: '',
      salutationValid: false,
      salutationDirty: false,
      genderValid: false,
      genderDirty: false,
      email: '',
      emailValid: false,
      emailDirty: false,
      username: '',
      password: '',
      country: '',
      countries: [],
      userPicture: null,

      showSuccessMessage: false,
      showFlashMessage: false,
      flashMessageText: ''
    };
  },
  async created() {
    // Check for JWT token and fetch user data for profile
    this.countries = await CountryService.getCountries(); // Fetch countries on component creation
      try {
        const userData = await fetchUserData();
        if (userData) {
          const userId = userData.id;
          const userResponse = await axios.get(`http://localhost:8080/users/${userId}`, {
            withCredentials: true,
          });
          this.user = userResponse.data;
          this.userid = this.user.id;
          console.log('Fetched user data:', this.user);
          console.log('Fetched user id:', this.userid);
          this.firstName = this.user.firstName;
          this.lastName = this.user.lastName;
          this.salutation = this.user.salutation
          this.gender = this.user.gender;
          this.email = this.user.email;
          this.username = this.user.userName;
          this.country = this.user.countryId;
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
  },
  methods: {
    async updateProfile() {
      try {
        const formData = {
          firstName: this.firstName,
          lastName: this.lastName,
          salutation: this.salutation,
          gender: this.gender?.toUpperCase() ?? null,
          email: this.email,
          userName: this.username,
          id: this.userid,
          countryId: this.country,
        };
        console.log('Updating profile with data:', formData);
        const response = await axios.put(`http://localhost:8080/users/${this.user.id}`, formData, {
          withCredentials: true,
        });
        this.user = response.data;
        this.showFlashMessage = true;
        this.flashMessageText = 'Profile updated successfully';
        setTimeout(() => {
          this.showFlashMessage = false;
        }, 3000); // Adjust time as needed
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Error updating profile.');
      }
    },
  },

  watch: {}

};

</script>

<template>
  <div class="container">
    <h1>
      My UserProfile
    </h1>
    <hr>
    <div v-if="showFlashMessage" class="flash-message">
      {{ flashMessageText }}
      <span class="icon"></span>
    </div>
    <div v-if="showSuccessMessage" class="alert alert-success" role="alert">
      Registration successful!
    </div>

    <!-- User Profile Section -->
    <div v-if="user">
      <div class="row">
        <div class="col-12 col-md-6">
          <h2>User Profile</h2>
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input type="text" class="form-control" id="firstName" v-model="firstName">
            </div>
            <div class="mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input type="text" class="form-control" id="lastName" v-model="lastName">
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="email">
            </div>
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" v-model="username">
            </div>
            <div class="mb-3">
              <label for="country" class="form-label">Country</label>
              <select class="form-select" id="country" v-model="country">
                <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="salutation" class="form-label">Salutation</label>
              <input type="text" class="form-control" id="salutation" v-model="salutation">
            </div>

            <div class="mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select class="form-select" id="gender" v-model="gender">
                <option v-for="option in genderOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="mb-3">
              <img class="rounded-circle" :src="user.picture" alt="Profile Picture" width="100" height="100">
            </div>
            <button type="submit" class="btn btn-primary">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Please log in to view your profile.</p>
    </div>

    </div>

</template>

<style scoped>

</style>