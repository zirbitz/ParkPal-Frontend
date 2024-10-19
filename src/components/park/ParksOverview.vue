<script setup>
import { computed, onMounted, ref } from 'vue';
import ParkCard from "@/components/park/ParkCard.vue";
import ParkInfo from "@/components/park/ParkInfo.vue";
import { API_ROUTES } from "@/apiRoutes.js";
import axios from "axios";

// Refs for parks, selected park, and search query
const parks = ref([]);
const selectedPark = ref(null);
const searchQuery = ref('');
const loadingEvents = ref(false);

// Fetch parks from backend
const fetchParks = async () => {
  try {
    const response = await axios.get(API_ROUTES.PARKS);
    if (response && response.data) {
      parks.value = response.data; // Set parks data initially
      console.log(response.data);

      // Fetch event details for each park after the parks are loaded
      parks.value.forEach((park) => fetchEventDetails(park));
    } else {
      console.error('Failed to fetch parks.');
    }
  } catch (error) {
    console.error('Error fetching parks:', error);
  }
};

// Fetch event details for a specific park
const fetchEventDetails = async (park) => {
  try {
    // Check if eventIds exist and have length
    if (!park.eventIds || park.eventIds.length === 0) {
      console.error('No event IDs found for this park');
      return;
    }

    const eventPromises = park.eventIds.map(eventId =>
        axios.get(`http://localhost:8080/events/${eventId}`)
    );
    const eventResponses = await Promise.all(eventPromises);
    const fullEvents = eventResponses.map(response => response.data);

    // Ensure the park gets updated in place to trigger reactivity
    const updatedPark = { ...park, events: fullEvents || [] }; // Default empty array if no events
    const parkIndex = parks.value.findIndex(p => p.id === park.id);
    if (parkIndex !== -1) {
      parks.value[parkIndex] = updatedPark; // Update park in the array with events
    }
  } catch (error) {
    console.error('Error fetching event details:', error);
  }
};

// Fetch parks when the component is mounted
onMounted(() => {
  fetchParks();
});

// Show ParkInfo modal and fetch detailed event information for modal view
const showParkSection = (park) => {
  selectedPark.value = park;  // Select the park for modal view
};

// Close the modal
const closeModal = () => {
  selectedPark.value = null;
};

// Computed property for filtering parks
const filteredParks = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return parks.value;

  return parks.value.filter(park => {
    const parkName = park.name ? park.name.toLowerCase() : '';
    const parkAddress = park.address ? park.address.toLowerCase() : '';
    return parkName.includes(query) || parkAddress.includes(query);
  });
});
</script>

<template>
  <div class="container">
    <h2>Parks</h2>
    <nav class="navbar bg-body-tertiary">
      <div class="d-flex justify-content-start">
        <form class="d-flex justify-content-end" role="search" @submit.prevent>
          <input
              class="form-control me-2"
              type="search"
              placeholder="Search parks by name or address"
              aria-label="Search"
              v-model="searchQuery"
          />
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </nav>

    <div v-if="filteredParks.length === 0" class="alert alert-warning mt-3" role="alert">
      No parks found matching your search criteria.
    </div>

    <div v-else class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col" v-for="park in filteredParks" :key="park.id">
        <ParkCard id="park-card"
                  :title="park.name"
                  :address="park.address"
                  :events="park.events || []"
        @click="showParkSection(park)">
        </ParkCard>
      </div>
    </div>

    <div v-if="selectedPark" class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title mx-auto">{{ selectedPark.name }}</h5>
            <button type="button" class="btn btn-primary" @click="closeModal">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="loadingEvents" class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div v-else>
              <ParkInfo
                  :title="selectedPark.name"
                  :description="selectedPark.description"
                  :address="selectedPark.address"
                  :events="selectedPark.events || []"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  max-width: 800px;
  width: 100%;
}

.modal.fade.show {
  display: block;
  opacity: 1;
  transition: opacity 0.15s linear;
}

.btn-primary {
  font-size: 1.25rem;
  padding: 0.25rem 0.5rem;
  position: absolute;
  right: 10px;
}

#park-card {
  cursor: pointer;
}

#park-card {
  cursor: pointer;
  background-color: white; /* Set initial background color */
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, background-color 0.3s ease; /* Smooth transition */
}

#park-card:hover {
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5);
}

#park-card:active {
  background-color: #f0f8ff;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.8);
}

.btn-outline-success{
  color: #056105;
}
.btn-outline-success:hover{
  color: white;
  background: #00e300;
}
</style>
