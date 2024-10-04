<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import CountryService from "@/service/countryService.js";
import { fetchUserData } from "@/service/authService.js";
import { API_ROUTES } from "@/apiRoutes.js";
import EventCard from "@/components/event/EventCard.vue";
import router from "@/router.js"; // Assuming EventCard component exists

// Profile Data
const user = ref(null);
const userid = ref(null);
const genderOptions = ref(['FEMALE', 'MALE', 'OTHER']);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const username = ref('');
const country = ref('');
const countries = ref([]);
const salutation = ref('');
const gender = ref('');
const profilePictureId = ref('');
const profilePictureUrl = ref('');
const showFlashMessage = ref(false);
const flashMessageText = ref('');

// Events Data
const events = ref([]);
const eventPage = ref(1);
const eventsPerPage = ref(2);

// Computed property for pagination
const totalEventPages = computed(() => Math.ceil(events.value.length / eventsPerPage.value));
const paginatedEvents = computed(() => {
  const start = (eventPage.value - 1) * eventsPerPage.value;
  return events.value.slice(start, start + eventsPerPage.value);
});

const fetchUserProfileAndEvents = async () => {
  try {
    // Fetch the logged-in user's profile
    const userData = await fetchUserData();
    if (userData) {
      const userId = userData.id;
      const userResponse = await axios.get(API_ROUTES.USERS_BY_ID(userId), {
        withCredentials: true,
      });
      user.value = userResponse.data;
      userid.value = user.value.id;
      firstName.value = user.value.firstName;
      lastName.value = user.value.lastName;
      salutation.value = user.value.salutation;
      gender.value = user.value.gender;
      email.value = user.value.email;
      username.value = user.value.userName;
      country.value = user.value.countryId;
      profilePictureUrl.value = user.value.profilePictureId ?? null;

      //TODO:route does not work, wait for fix in the backend
      const eventsResponse = await axios.get(API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS(userData.id.value), {
      });

      if (eventsResponse && eventsResponse.data && Array.isArray(eventsResponse.data)) {
        events.value = eventsResponse.data;
        console.log("Events fetched successfully:", events.value); // Debugging
      } else {
        console.error("No events found in the response or the response is not in the expected format.");
      }
    }
  } catch (error) {
    console.error('Failed to fetch user or events data:', error);
  }
};

// Pagination functions for events
const prevEventPage = () => {
  if (eventPage.value > 1) eventPage.value--;
};
const nextEventPage = () => {
  if (eventPage.value < totalEventPages.value) eventPage.value++;
};
const goToEventPage = (page) => {
  eventPage.value = page;
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

// Update profile
const updateProfile = async () => {
  try {
    const formData = {
      firstName: firstName.value,
      lastName: lastName.value,
      salutation: salutation.value,
      gender: gender.value?.toUpperCase() ?? null,
      email: email.value,
      userName: username.value,
      id: userid.value,
      countryId: country.value,
    };
    if (profilePictureId.value) {
      formData.profilePictureId = profilePictureId.value;
    }
    const response = await axios.put(API_ROUTES.USERS_BY_ID(userid.value), formData, {
      withCredentials: true,
    });
    user.value = response.data;
    showFlashMessage.value = true;
    flashMessageText.value = 'Profile updated successfully';
    setTimeout(() => {
      showFlashMessage.value = false;
    }, 3000);
  } catch (error) {
    console.error('Failed to update profile:', error);
    alert('Error updating profile.');
  }
};

const deleteUserProfile = async () => {
  if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
    try {
      await axios.delete(API_ROUTES.USERS_BY_ID(userid.value), {
        withCredentials: true,
      });
      alert('Profile deleted successfully.');
      // Redirect or handle post-deletion, e.g., log out the user
      await router.push("/login");
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Error deleting profile.');
    }
  }
};

// Handle file upload for profile picture
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(API_ROUTES.FILES, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        profilePictureId.value = response.data;
        profilePictureUrl.value = URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  }
};

// Fetch countries and user profile on component mount
onMounted(async () => {
  countries.value = await CountryService.getCountries();
  fetchUserProfileAndEvents();
});
</script>

<template>
  <div class="container">
    <h1>My UserProfile</h1>
    <hr>
    <div v-if="showFlashMessage" class="flash-message">
      {{ flashMessageText }}
    </div>
    <div v-if="user">
      <div class="row">
        <div class="col-12 col-md-6">
          <h2>User Profile</h2>
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input type="text" class="form-control" id="firstName" v-model="firstName">
            </div>
            <div class="mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input type="text" class="form-control" id="lastName" v-model="lastName">
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="email">
            </div>
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" v-model="username">
            </div>
            <div class="mb-3">
              <label for="country" class="form-label">Country</label>
              <select class="form-select" id="country" v-model="country">
                <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="salutation" class="form-label">Salutation</label>
              <input type="text" class="form-control" id="salutation" v-model="salutation">
            </div>
            <div class="mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select class="form-select" id="gender" v-model="gender">
                <option v-for="option in genderOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="profilePicture" class="form-label">Profile Picture</label>
              <input type="file" class="form-control" id="profilePicture" @change="handleFileUpload">
              <div v-if="profilePictureUrl" class="mt-3">
                <img :src="profilePictureUrl" alt="Profile Picture" class="img-thumbnail" width="150">
              </div>
            </div>
            <div class="col btn-col text-center">
              <button type="submit" class="btn btn-primary">Update Profile</button>
              <button type="button" class="btn btn-tertiary ms-5" @click="deleteUserProfile">Delete Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="card mt-5 mb-2">
      <div class="card-body">
        <h2>My Events</h2>
        <div v-if="events.length > 0" class="row row-cols-1 row-cols-md-2 g-4 mt-2">
          <div v-for="(event, index) in paginatedEvents" :key="event.id" class="event-card col">
            <EventCard :events="[event]" />
            <div class="d-flex justify-content-between mt-3 mb-3">
              <button class="btn btn-tertiary" @click="updateEvent(index)">Edit</button>
              <button class="btn btn-primary" @click="deleteEvent(index)">Delete</button>
            </div>
          </div>
        </div>
        <nav v-if="events.length > 0" aria-label="Event page navigation">
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
        <div v-else>
          <p>No events found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>