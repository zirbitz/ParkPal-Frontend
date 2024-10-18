<template>
  <div class="container mt-5">
    <div v-if="showErrorPopup" class="alert alert-danger mt-3" role="alert">
      Please fill in all required fields before submitting.
    </div>
    <div v-if="showSuccessPopup" class="alert alert-success mt-3" role="alert">
      Park update successful
    </div>
    <h2 class="mb-4">Edit a Park</h2>

    <!-- Park Search Field -->
    <div class="mb-3">
      <label for="parkSearch" class="form-label">Search for Park to Update *</label>
      <input
          type="text"
          id="parkSearch"
          v-model="parkSearchQuery"
          @input="filterParks"
          class="form-control"
          placeholder="Search parks by name..."
      />
      <div v-if="filteredParks.length > 0" class="search-results mt-2">
        <ul class="list-group">
          <li
              v-for="park in filteredParks"
              :key="park.id"
              class="list-group-item"
              @click="selectPark(park)"
              :class="{ 'active': park.id === selectedPark?.id }"
          >
            {{ park.name }}
          </li>
        </ul>
      </div>
      <div v-else class="mt-2">
        <p>No parks found matching "{{ parkSearchQuery }}".</p>
      </div>
    </div>

    <!-- Form to Update Park -->
    <form @submit.prevent="submitForm" v-if="selectedPark">
      <!-- Park Name -->
      <div class="mb-3">
        <label for="name" class="form-label">Park Name *</label>
        <input
            type="text"
            id="name"
            v-model="form.name"
            @input="validateName"
            @blur="validateName"
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
            @blur="validateDescription"
            :class="['form-control', errors.description ? 'is-invalid' : '']"
            placeholder="Enter Park Description"
        ></textarea>
        <div v-if="errors.description" class="invalid-feedback">
          {{ errors.description }}
        </div>
      </div>

      <!-- Address Section -->
      <div class="mb-3">
        <h4>Address</h4>

        <!-- Street and Number -->
        <div class="mb-3">
          <label for="streetNumber" class="form-label">Street and Number *</label>
          <input
              type="text"
              id="streetNumber"
              v-model="form.address.streetNumber"
              @input="validateStreetNumber"
              @blur="validateStreetNumber"
              :class="['form-control', errors.streetNumber ? 'is-invalid' : '']"
              placeholder="Enter Street and Number"
          />
          <div v-if="errors.streetNumber" class="invalid-feedback">
            {{ errors.streetNumber }}
          </div>
        </div>

        <!-- ZIP Code -->
        <div class="mb-3">
          <label for="zipCode" class="form-label">ZIP Code *</label>
          <input
              type="text"
              id="zipCode"
              v-model="form.address.zipCode"
              @input="validateZipCode"
              @blur="validateZipCode"
              :class="['form-control', errors.zipCode ? 'is-invalid' : '']"
              placeholder="Enter ZIP Code"
          />
          <div v-if="errors.zipCode" class="invalid-feedback">
            {{ errors.zipCode }}
          </div>
        </div>

        <!-- City -->
        <div class="mb-3">
          <label for="city" class="form-label">City *</label>
          <input
              type="text"
              id="city"
              v-model="form.address.city"
              @input="validateCity"
              @blur="validateCity"
              :class="['form-control', errors.city ? 'is-invalid' : '']"
              placeholder="Enter City"
          />
          <div v-if="errors.city" class="invalid-feedback">
            {{ errors.city }}
          </div>
        </div>

        <!-- Country Dropdown -->
        <div class="mb-3">
          <label for="country" class="form-label">Country *</label>
          <select
              id="country"
              v-model="form.address.country"
              @input="validateCountry"
              @blur="validateCountry"
              :class="['form-select', errors.country ? 'is-invalid' : '']"
          >
            <option value="">Select a country</option>
            <option v-for="country in countries" :key="country.id" :value="country">
              {{ country.name }}
            </option>
          </select>
          <div v-if="errors.country" class="invalid-feedback">
            {{ errors.country }}
          </div>
        </div>
      </div>


      <div class="d-flex justify-content-between mb-3">
        <button type="submit" class="btn btn-primary">Update Park</button>
        <!-- Delete Button -->
        <button type="button" class="btn btn-tertiary" @click="deletePark">
          Delete Park
        </button>
      </div>
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
          country: null
        }
      },
      errors: {
        name: ''
      },
      selectedPark: null, // To store selected park
      parks: [], // List of all parks
      filteredParks: [], // Filtered parks based on search query
      countries: [], // List of countries
      parkSearchQuery: '', // Query for searching parks
      showErrorPopup: false,
      showSuccessPopup: false
    };
  },
  mounted() {
    this.fetchParks(); // Fetch the list of all parks when the component mounts
    this.fetchCountries(); // Fetch the list of countries
    this.validateAllFields(); // Validate all fields on page load
  },
  methods: {

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
      } else {
        this.errors.description = "";
      }
    },

    // Validate Street Number
    validateStreetNumber() {
      if (!this.form.address.streetNumber) {
        this.errors.streetNumber = "Street and number are required";
      } else {
        this.errors.streetNumber = "";
      }
    },

    // Validate ZIP Code
    validateZipCode() {
      if (!this.form.address.zipCode) {
        this.errors.zipCode = "ZIP code is required";
      } else {
        this.errors.zipCode = "";
      }
    },

    // Validate City
    validateCity() {
      if (!this.form.address.city) {
        this.errors.city = "City is required";
      } else {
        this.errors.city = "";
      }
    },

    // Validate Country
    validateCountry() {
      if (!this.form.address.country) {
        this.errors.country = "Country is required";
      } else {
        this.errors.country = "";
      }
    },

    // Validate all fields at once
    validateAllFields() {
      this.validateName();
      this.validateDescription();
      this.validateStreetNumber();
      this.validateZipCode();
      this.validateCity();
      this.validateCountry();
    },

    async fetchParks() {
      try {
        const response = await axios.get(API_ROUTES.PARKS, {withCredentials: true}); // Fetch all parks without pagination
        this.parks = response.data;
        this.filteredParks = this.parks; // Initially, all parks are displayed
      } catch (error) {
        console.error('Error fetching parks:', error);
      }
    },
    async fetchCountries() {
      try {
        const response = await axios.get(API_ROUTES.COUNTRIES, {withCredentials: true});
        this.countries = response.data.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    },
    async fetchCountryById(countryId) {
      try {
        console.log(countryId)
        const response = await axios.get(`${API_ROUTES.COUNTRIES}/${countryId}`, {withCredentials: true});
        return response.data;  // Return the country data
      } catch (error) {
        console.error('Error fetching country by ID:', error);
        return null;  // Return null if there's an error
      }
    },
    async selectPark(park) {
      this.selectedPark = park;

      let country = null;

      if (park.address?.country) {
        // Check if the country is an object or just an ID
        if (typeof park.address.country === 'object' && park.address.country.name) {
          // If it's already an object, find the corresponding country in the countries array
          country = this.countries.find(c => c.id === park.address.country.id);
        } else {
          // If it's an ID, find it in the pre-fetched countries list
          country = this.countries.find(c => c.id === park.address.country);

          // If it's still not found, fetch it from the API
          if (!country) {
            country = await this.fetchCountryById(park.address.country);
          }
        }
      }

      // Update form with selected park details
      this.form = {
        name: park.name || '',
        description: park.description || '',
        address: {
          streetNumber: park.address?.streetNumber || '',
          zipCode: park.address?.zipCode || '',
          city: park.address?.city || '',
          country: country || null  // Ensure we assign the correct country object
        }
      };

      // Reset validation errors
      this.errors = {
        name: '',
        description: '',
        streetNumber: '',
        zipCode: '',
        city: '',
        country: ''
      };


      console.log(this.form.address.country);  // Debug: check if the country object is correctly set
    },
    async submitForm() {
      // Validate all fields before submitting
      this.validateAllFields();

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

      if (!this.errors.name) {
        const payload = {
          ...this.form,
          address: {
            ...this.form.address,
            country: this.form.address.country.id // Send only country ID
          }
        };

        try {
          const response = await axios.put(`${API_ROUTES.PARKS}/${this.selectedPark.id}`, payload, {withCredentials: true});
          this.showSuccessPopup = true; // Show success popup
          window.scrollTo(0, 0); // Scroll to the top

          setTimeout(() => {
            this.showSuccessPopup = false; // Hide popup after 3 seconds
          }, 3000);
        } catch (error) {
          console.error('Error updating park:', error);
        }
      }
    },
    // Delete the selected park
    async deletePark() {
      if (confirm('Are you sure you want to delete this park?')) {
        try {
          await axios.delete(`${API_ROUTES.PARKS}/${this.selectedPark.id}`, {withCredentials: true});
          console.log('Park deleted successfully');
          this.selectedPark = null;
          this.form = {
            name: '',
            description: '',
            address: {
              streetNumber: '',
              zipCode: '',
              city: '',
              country: null
            }
          };
          // Fetch updated parks list
          await this.fetchParks();
        } catch (error) {
          console.error('Error deleting park:', error);
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

.search-results {
  max-height: 200px;
  overflow-y: auto;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item.active {
  background-color: #007bff;
  color: white;
}

.is-invalid {
  border-color: red;
}

.error {
  color: red;
  font-size: 0.875rem;
}
</style>
