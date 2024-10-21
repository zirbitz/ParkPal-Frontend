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
const mediaFiles = ref([]);
const filesPerPage = 5;

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
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * filesPerPage;
  return mediaFiles.value.slice(start, start + filesPerPage);
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

// TODO: get Userdata from here to work bc users.value is empty but users are not!
const fetchMediaFiles = async () => {
  try {
    console.log(users)
    console.log(users.value)

    // Extract unique media file IDs from both mediaIds and profilePictureIds, flattening and removing duplicates
    const mediaIds = [...new Set(
        users.value
            .map(user => [
              ...(user.mediaIds || []), // Safely include mediaIds array
              user.profilePictureId || null // Include profilePictureId only if it exists
            ])
            .reduce((acc, curr) => acc.concat(curr), []) // Flatten the array
            .filter(id => id) // Filter out null or undefined values
    )];

    if (mediaIds.length === 0) {
      console.log("No media IDs found for any user.");
      mediaFiles.value = [];
      return;
    }

    // Fetch media files for each ID with response type 'blob' to handle binary data like images
    const mediaRequests = mediaIds.map(id =>
        axios.get(`http://localhost:8080/files/${id}`, {
          responseType: 'blob', // Ensure the response is a binary blob
        })
    );

    const mediaResponses = await Promise.all(mediaRequests);


    mediaFiles.value = mediaResponses.map((res, index) => ({
      id: mediaIds[index], // Storing the corresponding file ID
      url: URL.createObjectURL(res.data),
      mimeType: res.headers['content-type']
    }));

  } catch (error) {
    console.error("Error fetching media files:", error);
  }
};
const isImage = (mimeType) => {
  return mimeType.startsWith('image/');
};

const isVideo = (mimeType) => {
  return mimeType.startsWith('video/');
};

const deleteFile = async (index) => {
  try {
    // Assume that media file URLs have the file ID embedded or another way to reference the file.
    const file = paginatedFiles.value[index];

    // Extract the file ID from the URL or store it when fetching the files earlier
    const fileId = file.id; // This assumes you stored the ID in the file object when fetching mediaFiles

    await axios.delete(`http://localhost:8080/files/${fileId}`, { withCredentials: true });

    mediaFiles.value = mediaFiles.value.filter((_, i) => i !== index);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
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
    await axios.delete(`http://localhost:8080/events/${event.id}`, {withCredentials: true}); // Assuming DELETE API exists
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
const lockUser = async (index) => {
  try {
    const user = paginatedUsers.value[index];
    await axios.post(`http://localhost:8080/admins/${user.id}/status`, null, {
      params: { locked: !user.locked }, // Toggle lock status
      withCredentials: true,
    });
    // Option 1: Update the specific user directly
    paginatedUsers.value[index].locked = !user.locked;
    console.log("User locked status toggled successfully");
  } catch (error) {
    console.error("Error locking user:", error);
  }
};

const toggleUserRole = async (index) => {
  try {
    const user = paginatedUsers.value[index];
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    await axios.post(`http://localhost:8080/admins/${user.id}/status`, null, {
      params: { role: newRole },
      withCredentials: true,
    });
    // Option 2: Update user role directly
    paginatedUsers.value[index].role = newRole;
    console.log("User role updated successfully");
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};

// Delete user function
const deleteUser = async (index) => {
  try {
    const user = paginatedUsers.value[index];
    await axios.delete(`http://localhost:8080/users/${user.id}`, {withCredentials: true}); // Assuming DELETE API exists
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
onMounted(async () => {
  await fetchUsers();  // Ensure users are fetched first
  fetchMediaFiles();   // Now call fetchMediaFiles after users are loaded
  fetchEvents();       // Fetch events as usual
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
              <EventCard :event="event"/>
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
            <div v-if="paginatedFiles.length === 0" class="alert alert-info">
              No files available.
            </div>
            <div v-else>
              <table class="table table-bordered">
                <thead>
                <tr>
                  <th>Preview</th>
                  <th>File Type</th>
                  <th>Action</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(file, index) in paginatedFiles" :key="index">
                  <td>
                    <img v-if="isImage(file.mimeType)" :src="file.url" class="img-thumbnail" width="100" alt="File Preview">
                    <video v-if="isVideo(file.mimeType)" :src="file.url" class="video-preview" width="100" controls></video>
                  </td>
                  <td>{{ file.mimeType }}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" @click="deleteFile(index)">Delete</button>
                  </td>
                </tr>
                </tbody>
              </table>
              <nav aria-label="File page navigation">
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
                  <button class="btn btn-warning btn-sm ms-2" @click="lockUser(index)">
                    {{ user.locked ? 'Unlock' : 'Lock' }}
                  </button>
                  <button class="btn btn-secondary btn-sm ms-2" @click="toggleUserRole(index)">
                    {{ user.role === 'ADMIN' ? 'Change to User' : 'Change to Admin' }}
                  </button>
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
