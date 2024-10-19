<template>
  <div class="container mt-5">
    <div v-if="showErrorPopup" class="alert alert-danger mt-3" role="alert">
      Please fill in all required fields before submitting.
    </div>
    <div v-if="showSuccessPopup" class="alert alert-success mt-3" role="alert">
      Park successfully created
    </div>
    <h2 class="mb-4">Create a Park</h2>
    <form @submit.prevent="submitForm">
      <!-- Park Name -->
      <div class="mb-3">
        <label for="name" class="form-label">Park Name *</label>
        <input
            type="text"
            id="name"
            v-model="form.name"
            @input="validateName"
            :class="['form-control', errors.name ? 'is-invalid' : '']"
            placeholder="Enter Park Name"
        />
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <!-- Park Description -->
      <div class="mb-3">
        <label for="description" class="form-label">Description *</label>
        <textarea
            id="description"
            v-model="form.description"
            @input="validateDescription"
            :class="['form-control', errors.description ? 'is-invalid' : '']"
            placeholder="Enter Park Description"
        ></textarea>
        <div v-if="errors.description" class="invalid-feedback">
          {{ errors.description }}
        </div>
      </div>

      <!-- Address -->
      <div class="mb-3">
        <h4>Address</h4>

        <div class="mb-3">
          <label for="streetNumber" class="form-label">Street and Number</label>
          <input
              type="text"
              id="streetNumber"
              v-model="form.address.streetNumber"
              @input="validateStreetNumber"
              :class="['form-control', errors.streetNumber ? 'is-invalid' : '']"
              placeholder="Enter Street and Number"
          />
          <div v-if="errors.streetNumber" class="invalid-feedback">
            {{ errors.streetNumber }}
          </div>
        </div>

        <div class="mb-3">
          <label for="zipCode" class="form-label">ZIP Code</label>
          <input
              type="text"
              id="zipCode"
              v-model="form.address.zipCode"
              @input="validateZipCode"
              :class="['form-control', errors.zipCode ? 'is-invalid' : '']"
              placeholder="Enter ZIP Code"
          />
          <div v-if="errors.zipCode" class="invalid-feedback">
            {{ errors.zipCode }}
          </div>
        </div>

        <div class="mb-3">
          <label for="city" class="form-label">City</label>
          <input
              type="text"
              id="city"
              v-model="form.address.city"
              @input="validateCity"
              :class="['form-control', errors.city ? 'is-invalid' : '']"
              placeholder="Enter City"
          />
          <div v-if="errors.city" class="invalid-feedback">
            {{ errors.city }}
          </div>
        </div>

        <!-- Country (Dropdown) -->
        <div class="mb-3">
          <label for="country" class="form-label">Country</label>
          <select
              id="country"
              v-model="form.address.country"
              @change="validateCountry"
              :class="['form-select', errors.country ? 'is-invalid' : '']"
          >
            <option value="">Select a country</option>
            <option v-for="country in countries" :key="country.id" :value="country.name">
              {{ country.name }}
            </option>
          </select>
          <div v-if="errors.country" class="invalid-feedback">
            {{ errors.country }}
          </div>
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
      countries: [], // To store the list of countries
      showErrorPopup: false, // For error popup
      showSuccessPopup: false // For success popup
    };
  },


  mounted() {
    this.fetchCountries();
    this.validateAllFields(); // Validate all fields on page load
  },

  methods: {

    validateAllFields() {
      this.validateName();
      this.validateDescription();
      this.validateStreetNumber();
      this.validateZipCode();
      this.validateCity();
      this.validateCountry();
    },

    // Validate Park Name
    validateName() {
      if (!this.form.name) {
        this.errors.name = "Park name is required";
      } else {
        this.errors.name = "";
      }
    },

    // Validate Description
    validateDescription() {
      if (!this.form.description) {
        this.errors.description = "Description is required";
      } else if (description.value.length > 1000) {
        this.errors.description = 'Description must be under 1000 characters.';
      } else {
        this.errors.description = "";
      }
    },

    // Validate Street Number
    validateStreetNumber() {
      if (!this.form.address.streetNumber) {
        this.errors.streetNumber = "Street and number are required.";
      } else {
        this.errors.streetNumber = "";
      }
    },

    // Validate ZIP Code
    validateZipCode() {
      if (!this.form.address.zipCode) {
        this.errors.zipCode = "ZIP code is required.";
      } else {
        this.errors.zipCode = "";
      }
    },

    // Validate City
    validateCity() {
      if (!this.form.address.city) {
        this.errors.city = "City is required.";
      } else {
        this.errors.city = "";
      }
    },

    // Validate Country
    validateCountry() {
      if (!this.form.address.country) {
        this.errors.country = "Country is required.";
      } else {
        this.errors.country = "";
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
      // Validate all fields before submitting
      this.validateName();
      this.validateStreetNumber();
      this.validateZipCode();
      this.validateCity();
      this.validateCountry();

      // Check if there are any validation errors
      const hasErrors = Object.values(this.errors).some((error) => error);
      if (hasErrors) {
        this.showErrorPopup = true; // Show the error popup
        window.scrollTo(0, 0); // Scroll to the top
        setTimeout(() => {
          this.showErrorPopup = false; // Hide the popup after 3 seconds
        }, 3000);
        return; // Exit the method if there are errors
      }

      // Proceed with the submission if no errors
      const payload = {
        ...this.form,
        address: {
          ...this.form.address,
          country: this.form.address.country.id // Assuming country is an object with an id
        }
      };

      try {
        const response = await axios.post(API_ROUTES.PARKS, payload, { withCredentials: true });
        this.showSuccessPopup = true; // Show success popup
        window.scrollTo(0, 0); // Scroll to the top

        setTimeout(() => {
          this.showSuccessPopup = false; // Hide popup after 3 seconds
        }, 3000);
      } catch (error) {
        console.error('Error creating park:', error);
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
