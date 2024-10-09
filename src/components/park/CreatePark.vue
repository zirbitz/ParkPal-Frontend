<template>
  <div class="container mt-5">
    <h2 class="mb-4">Create a Park</h2>
    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="name" class="form-label">Park Name *</label>
        <input
            type="text"
            id="name"
            v-model="form.name"
            @blur="validateName"
            :class="['form-control', errors.name ? 'is-invalid' : '']"
            placeholder="Enter Park Name"
        />
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <!-- Park Description (Optional) -->
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea
            id="description"
            v-model="form.description"
            class="form-control"
            placeholder="Enter Park Description"
        ></textarea>
      </div>

      <!-- TODO:Make this work in the backend. Address (Nested Object) -->
      <div class="mb-3">
        <h4>Address</h4>

        <div class="mb-3">
          <label for="streetNumber" class="form-label">Street and Number</label>
          <input
              type="text"
              id="streetNumber"
              v-model="form.address.streetNumber"
              class="form-control"
              placeholder="Enter Street and Number"
          />
        </div>

        <div class="mb-3">
          <label for="zipCode" class="form-label">ZIP Code</label>
          <input
              type="text"
              id="zipCode"
              v-model="form.address.zipCode"
              class="form-control"
              placeholder="Enter ZIP Code"
          />
        </div>

        <div class="mb-3">
          <label for="city" class="form-label">City</label>
          <input
              type="text"
              id="city"
              v-model="form.address.city"
              class="form-control"
              placeholder="Enter City"
          />
        </div>

        <!-- Country (Dropdown) -->
        <div class="mb-3">
          <label for="country" class="form-label">Country</label>
          <select
              id="country"
              v-model="form.address.country"
              class="form-select"
          >
            <option v-for="country in countries" :key="country.id" :value="country">
              {{ country.name }}
            </option>
          </select>
        </div>
      </div>

      <button type="submit" class="btn btn-primary mb-5">Create Park</button>
    </form>
  </div>
</template>

<script>
// Import axios and API_ROUTES
import axios from 'axios';
import { API_ROUTES } from '@/apiRoutes.js';

export default {
  data() {
    return {
      form: {
        name: '',
        description: '',
        address: {
          streetNumber: '',
          zipCode: '',
          city: '',
          country: null // Country will be an object
        }
      },
      errors: {
        name: ''
      },
      countries: [] // To store the list of countries
    };
  },
  mounted() {
    this.fetchCountries();
  },
  methods: {
    validateName() {
      // Check if name is empty
      if (!this.form.name) {
        this.errors.name = "Park name not found. All parks need a name.";
      } else {
        this.errors.name = "";
      }
    },
    async fetchCountries() {
      try {
        // Fetch the list of countries from the backend
        const response = await axios.get(API_ROUTES.COUNTRIES);

        // Sort the countries by name (assuming response.data contains an array of country objects)
        this.countries = response.data.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    },
    async submitForm() {
      // Validation check before submitting
      this.validateName();

      if (!this.errors.name) {
        // Send the entire country object instead of just the country ID
        const payload = {
          ...this.form,
          address: {
            ...this.form.address,
            country: this.form.address.country.id
          }
        };
        try {
          const response = await axios.post(API_ROUTES.PARKS, payload, {withCredentials: true});
          console.log('Park created successfully', response.data);
        } catch (error) {
          console.error('Error creating park:', error);
        }
      }
    }
  }
};
</script>

<style scoped>
.create-park-form {
  max-width: 600px;
  margin: auto;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input,
textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1rem;
}
.is-invalid {
  border-color: red;
}
.error {
  color: red;
  font-size: 0.875rem;
}
</style>
