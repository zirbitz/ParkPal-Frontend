<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();
import EventCard from "@/components/event/EventCard.vue";

// Define state for users, events, files, and pagination
const users = ref([]);
const events = ref([]); // Store events here
const currentPage = ref(1);
const eventPage = ref(1); // Separate current page for events
const itemsPerPage = 5; // Adjust number of items per page for users
const eventsPerPage = 2; // Set number of events per page to 2

// Search-related state
const searchQuery = ref(""); // Store the search query

// Calculate total pages for users and events
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));
const totalEventPages = computed(() => Math.ceil(events.value.length / eventsPerPage));

// Paginated users and events
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;

  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
      user.userName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const paginatedEvents = computed(() => {
  const start = (eventPage.value - 1) * eventsPerPage;
  return events.value.slice(start, start + eventsPerPage);
});

// Fetch users and events on component mount
const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/users'); // Ensure endpoint is correct
    users.value = response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const fetchEvents = async () => {
  try {
    const response = await axios.get('http://localhost:8080/events'); // Ensure endpoint is correct
    events.value = response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};
const deleteEvent = async (index) => {
  try {
    const event = paginatedEvents.value[index];
    await axios.delete(`http://localhost:8080/events/${event.id}`); // Assuming DELETE API exists
    events.value = events.value.filter(e => e.id !== event.id); // Remove event from list
  } catch (error) {
    console.error("Error deleting event:", error);
  }
};

// Update event function
const updateEvent = (index) => {
  const event = paginatedEvents.value[index];
  // For example:
  router.push(`/editevent/${event.id}`); // Assuming you have a route to edit the event
};

// Pagination controls for users and events
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToPage = (page) => {
  currentPage.value = page;
};

const prevEventPage = () => {
  if (eventPage.value > 1) eventPage.value--;
};
const nextEventPage = () => {
  if (eventPage.value < totalEventPages.value) eventPage.value++;
};
const goToEventPage = (page) => {
  eventPage.value = page;
};

// Delete user function
const deleteUser = async (index) => {
  try {
    const user = paginatedUsers.value[index];
    await axios.delete(`http://localhost:8080/users/${user.id}`); // Assuming DELETE API exists
    users.value = users.value.filter(u => u.id !== user.id); // Remove user from list
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

// Function to clear the search query and refresh users
const clearSearch = () => {
  searchQuery.value = ""; // Reset the search query
  fetchUsers(); // Re-fetch the user data
};

// Fetch users and events when component is mounted
onMounted(() => {
  fetchUsers();
  fetchEvents(); // Fetch events as well
});
</script>

<template>
  <div class="container">
    <h1>Admin Dashboard</h1>
    <hr>

    <div class="card mb-3">
      <div class="card-body">
        <h3>Parks</h3>
        <div class="row text-center">
          <div class="col-md-6 mb-3">
            <router-link to="/createpark" class="btn btn-primary me-2">Create New Park</router-link>
          </div>
          <div class="col-md-6">
            <router-link to="/editpark" class="btn btn-tertiary">Edit Existing Park</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Section with Pagination -->
    <div class="col">
      <div class="card mb-3">
        <div class="card-body">
          <h3 class="card-title mb-3">All Created Events</h3>
          <div class="row row-cols-1 row-cols-md-2 g-4 mt-2">
            <div v-for="(event, index) in paginatedEvents" :key="event.id" class="event-card col">
              <EventCard :events="[event]" />
              <div class="d-flex justify-content-between mt-3 mb-3">
                <button class="btn btn-tertiary btn-sm" @click="updateEvent(index)">Edit</button>
                <button class="btn btn-primary btn-sm" @click="deleteEvent(index)">Delete</button>
              </div>
            </div>
          </div>

          <nav aria-label="Event page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: eventPage === 1 }">
                <button class="page-link" @click="prevEventPage">Previous</button>
              </li>
              <li class="page-item" v-for="page in totalEventPages" :key="page" :class="{ active: eventPage === page }">
                <button class="page-link" @click="goToEventPage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: eventPage === totalEventPages }">
                <button class="page-link" @click="nextEventPage">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <div class="col">
      <div class="card mb-3">
        <div class="card-body">
          <h3 class="card-title">Uploaded User Media</h3>
          <p class="card-text">All files uploaded by Users:</p>

          <div id="app">
            <table class="table table-bordered">
              <thead>
              <tr>
                <th>Preview</th>
                <th>File Name</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(file, index) in paginatedFiles" :key="index">
                <td>
                  <img v-if="isImage(file)" :src="file.url" class="img-thumbnail" width="100">
                  <video v-if="isVideo(file)" :src="file.url" class="video-preview" width="100" controls></video>
                </td>
                <td>{{ file.name }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteFile(index)">Delete</button>
                </td>
              </tr>
              </tbody>
            </table>
            <nav aria-label="Page navigation">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="prevPage">Previous</button>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="nextPage">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>


    <div class="col">
      <div class="card mb-3">
        <div class="card-body">
          <h3 class="card-title">All Users</h3>
          <p class="card-text">All registered Users:</p>

          <!-- Search Input Field and Buttons -->
          <div class="input-group mb-3">
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Search users by name or email" aria-label="Search">
            <button class="btn btn-primary" @click="fetchUsers">Search</button>
            <button class="btn btn-tertiary ms-2" @click="clearSearch">Refresh</button>
          </div>

          <!-- Error Message if No Users Found -->
          <div v-if="filteredUsers.length === 0" class="alert alert-warning" role="alert">
            No users found matching your search.
          </div>

          <!-- Users Table -->
          <div id="app">
            <table class="table table-bordered">
              <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(user, index) in paginatedUsers" :key="index">
                <td>{{ user.userName }}</td> <!-- Changed to match userName from UserDto -->
                <td><a :href="'mailto:' + user.email" target="_blank">{{ user.email }}</a></td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteUser(index)">Delete</button>
                </td>
              </tr>
              </tbody>
            </table>

            <nav aria-label="Page navigation">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="prevPage">Previous</button>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="nextPage">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.event-card {
  width: 33%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .event-card {
    width: 100%;
  }
}
</style>
