<script setup>
import {computed, onMounted, ref} from 'vue';
import ParkCard from "@/components/park/ParkCard.vue";
import ParkInfo from "@/components/park/ParkInfo.vue";
import {API_ROUTES} from "@/apiRoutes.js";

// Refs for parks, selected park, and search query
const parks = ref([]);
const selectedPark = ref(null);
const searchQuery = ref('');  // Make sure searchQuery is a ref

// Fetch parks from backend
const fetchParks = async () => {
  try {
    const response = await fetch(API_ROUTES.PARKS);
    if (response.ok) {
      const data = await response.json();
      parks.value = data;
      console.log(data)// No need to fetch events separately, they are included in the ParkDto
    } else {
      console.error('Failed to fetch parks. Status:', response.status, 'StatusText:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching parks:', error);
  }
};

// Fetch parks when component is mounted
onMounted(() => {
  fetchParks();
});

// Show ParkInfo modal
const showParkSection = (park) => {
  selectedPark.value = park;
};

// Close the modal
const closeModal = () => {
  selectedPark.value = null;
};

// Computed property for filtering parks based on the search query
const filteredParks = computed(() => {
  const query = searchQuery.value.toString().toLowerCase(); // Access searchQuery.value
  if (!query) {
    return parks.value;
  }

  return parks.value.filter(park => {
    const parkName = park.name ? park.name.toString().toLowerCase() : '';
    const parkAddress = park.address ? park.address.toString().toLowerCase() : '';

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
          <!-- Bind input to searchQuery and handle input event -->
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

    <!-- Error message when no parks are found -->
    <div v-if="filteredParks.length === 0" class="alert alert-warning mt-3" role="alert">
      No parks found matching your search criteria.
    </div>

    <!-- Grid of ParkCards (filteredPparks) -->
    <div v-else class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col" v-for="park in filteredParks" :key="park.id">
        <ParkCard id="park-card"
            :title="park.name"
            :address="park.address"
            :events="park.parkEventDtos"
            @click="showParkSection(park)" >
        </ParkCard>
      </div>
    </div>

    <!-- Modal for ParkInfo -->
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
            <ParkInfo
                :title="selectedPark.name"
                :description="selectedPark.description"
                :address="selectedPark.address"
                :events="selectedPark.parkEventDtos"
            />
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

</style>
