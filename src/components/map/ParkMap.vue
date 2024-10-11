<template>
  <div>
    <div id="map" style="height: 500px; width: 100%;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const parks = ref([]); // Holds the parks data
const map = ref(null);

// Fetch parks data along with events
const fetchParks = async () => {
  try {
    const response = await axios.get('http://localhost:8080/parks', { withCredentials: true });
    parks.value = response.data;

    // Geocode parks and fetch events for each park
    for (const park of parks.value) {
      if (!park.lat || !park.lng) {
        await geocodeAddress(park); // Geocode the address to get lat/lng
      }
      park.events = await fetchEventsByPark(park.id); // Fetch events for the park
    }

    console.log('Fetched parks with coordinates and events:', parks.value);
  } catch (error) {
    console.error('Error fetching parks:', error);
  }
};

// Fetch events for a specific park by parkId
const fetchEventsByPark = async (parkId) => {
  try {
    const response = await axios.get('http://localhost:8080/events', {
      params: { parkId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for park ${parkId}:`, error);
    return [];
  }
};

// Geocode the park's address using OpenStreetMap Nominatim
const geocodeAddress = async (park) => {
  const addressString = `${park.address.streetNumber}, ${park.address.zipCode} ${park.address.city}, ${park.address.country.name}`;
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: addressString,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
    });

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      park.lat = parseFloat(location.lat);
      park.lng = parseFloat(location.lon);
    } else {
      console.warn(`No coordinates found for park: ${park.name}`);
    }
  } catch (error) {
    console.error(`Error geocoding address for park: ${park.name}`, error);
  }
};

// Initialize the map and add markers with park and event details
const initMap = () => {
  // Create the map and set the initial view
  map.value = L.map('map').setView([48.2082, 16.3738], 13);

  // Add the OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value);

  // Loop through each park and add a marker
  parks.value.forEach(park => {
    if (park.lat && park.lng) {
      const marker = L.marker([park.lat, park.lng]).addTo(map.value);

      // Prepare the popup content with event details
      let eventsContent = '<strong>Events:</strong><br>';
      if (park.events && park.events.length > 0) {
        eventsContent += '<ul>';
        park.events.forEach(event => {
          eventsContent += `
            <li>
              <strong>${event.title}</strong><br>
              ${new Date(event.startTS).toLocaleDateString()} - ${new Date(event.endTS).toLocaleDateString()}<br>
              ${event.description}<br><br>
            </li>
          `;
        });
        eventsContent += '</ul>';
      } else {
        eventsContent += 'No upcoming events available.';
      }

      // Combine park details and events
      const popupContent = `
        <b>${park.name}</b><br>
        ${park.description}<br>
        <strong>Address:</strong> ${park.address.streetNumber}, ${park.address.zipCode} ${park.address.city}, ${park.address.country.name}<br>
        ${eventsContent}
      `;

      // Bind the popup with park details and events
      marker.bindPopup(popupContent);

      // Open the popup when the marker is clicked
      marker.on('click', () => {
        marker.openPopup();
      });
    } else {
      console.warn(`Skipping park with missing coordinates: ${park.name}`);
    }
  });
};

// Initialize the map and fetch parks on component mount
onMounted(async () => {
  await fetchParks(); // Fetch parks and their events
  initMap(); // Initialize the map and add markers
});
</script>

<style scoped>
#map {
  height: 500px;
  width: 100%;
}
</style>
