<script setup>
import { computed, onMounted, ref } from 'vue';
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
    if (!park.eventIds || park.eventIds.length === 0) {
      console.error('No event IDs found for this park');
      return;
    }

    const eventPromises = park.eventIds.map(eventId =>
        axios.get(`http://localhost:8080/events/${eventId}`)
    );
    const eventResponses = await Promise.all(eventPromises);
    const fullEvents = eventResponses.map(response => response.data);

    const updatedPark = { ...park, events: fullEvents || [] }; // Default empty array if no events
    const parkIndex = parks.value.findIndex(p => p.id === park.id);
    if (parkIndex !== -1) {
      parks.value[parkIndex] = updatedPark;
    }
  } catch (error) {
    console.error('Error fetching event details:', error);
  }
};

// Fetch parks when the component is mounted
onMounted(() => {
  fetchParks();
});

const filteredParks = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return parks.value;

  return parks.value.filter(park => {
    const parkName = park.name ? park.name.toLowerCase() : '';
    const parkAddress = park.address
        ? `${park.address.streetNumber || ''} ${park.address.zipCode || ''} ${park.address.city || ''} ${park.address.country?.name || ''}`.toLowerCase()
        : '';

    return parkName.includes(query) || parkAddress.includes(query);
  });
});
</script>

<template>
  <div class="container mt-3">
    <h2>Parks</h2>
    <nav class="navbar bg-body-tertiary">
      <div class="d-flex justify-content-start">
        <form class="d-flex justify-content-end" role="search" @submit.prevent>
          <input
              class="form-control me-2"
              type="search"
              placeholder="Search parks ..."
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

    <div v-else class="row g-3 justify-content-center park-info-grid">
      <div class="col-12 col-lg-6" v-for="park in filteredParks" :key="park.id">
        <ParkInfo
            :title="park.name"
            :description="park.description"
            :address="park.address"
            :events="park.events || []"
        />
      </div>
    </div>
  </div>
</template>


<style scoped>
.park-info-grid {
  gap: 20px; /* Additional spacing between cards */
}

.card {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.card h5 {
  font-size: 1.25rem;
  font-weight: bold;
}

.card p {
  font-size: 0.9rem;
}

@media (max-width: 576px) {
  .card h5 {
    font-size: 1.1rem;
  }

  .card p {
    font-size: 0.85rem;
  }
}

@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}

@media (min-width: 992px) {
  .card {
    padding: 2rem;
  }
}
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
  max-height: 800px;
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

/* Fullscreen modal for mobile */
@media (max-width: 576px) {
  .mobile-modal .modal-dialog {
    max-width: 100%;
    margin: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .mobile-modal .modal-content {
    height: 100%;
    border-radius: 0;
  }

  .mobile-modal .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }

  .mobile-modal .modal-title {
    font-size: 1.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-modal .modal-body {
    padding: 1rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-modal .btn-primary {
    padding: 0.5rem;
  }
}
</style>
