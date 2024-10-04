<template>
  <div class="container mt-5">
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

      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea
            id="description"
            v-model="form.description"
            class="form-control"
            placeholder="Enter Park Description"
        ></textarea>
      </div>

      <!-- Address Section -->
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

        <!-- Country Dropdown -->
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
      parkSearchQuery: '' // Query for searching parks
    };
  },
  mounted() {
    this.fetchParks(); // Fetch the list of all parks when the component mounts
    this.fetchCountries(); // Fetch the list of countries
  },
  methods: {
    validateName() {
      if (!this.form.name) {
        this.errors.name = 'Park name is required.';
      } else {
        this.errors.name = '';
      }
    },
    async fetchParks() {
      try {
        const response = await axios.get(API_ROUTES.PARKS); // Fetch all parks without pagination
        this.parks = response.data;
        this.filteredParks = this.parks; // Initially, all parks are displayed
      } catch (error) {
        console.error('Error fetching parks:', error);
      }
    },
    async fetchCountries() {
      try {
        const response = await axios.get(API_ROUTES.COUNTRIES);
        this.countries = response.data.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    },
    filterParks() {
      const query = this.parkSearchQuery.trim().toLowerCase();
      this.filteredParks = this.parks.filter((park) =>
          park.name.toLowerCase().includes(query)
      );
    },
    selectPark(park) {
      this.selectedPark = park;
      this.form = {
        name: park.name || '',
        description: park.description || '',
        address: {
          streetNumber: park.address?.streetNumber || '',
          zipCode: park.address?.zipCode || '',
          city: park.address?.city || '',
          country: park.address?.country || null
        }
      };
    },
    async submitForm() {
      this.validateName();
      if (!this.errors.name) {
        const payload = {
          ...this.form,
          address: {
            ...this.form.address,
            country: {id: this.form.address.country.id} // Send only country ID
          }
        };
        try {
          const response = await axios.put(`${API_ROUTES.PARKS}/${this.selectedPark.id}`, payload);
          console.log('Park updated successfully', response.data);
        } catch (error) {
          console.error('Error updating park:', error);
        }
      }
    },
    // Delete the selected park
    async deletePark() {
      if (confirm('Are you sure you want to delete this park?')) {
        try {
          await axios.delete(`${API_ROUTES.PARKS}/${this.selectedPark.id}`);
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
