<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import axios from 'axios';
import CountryService from "@/service/countryService.js";
import {API_ROUTES} from "@/apiRoutes.js";
import router from "@/router.js";
import EventCard from "@/components/event/EventCard.vue";
import store from "@/store/index.js";
import {fetchUserIdAndRole} from "@/service/authService.js";
import {onBeforeRouteLeave} from "vue-router";

// Declare your refs and other variables here

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
const profilePictureUrl = ref(''); // To store profile picture URL or uploaded picture
const originalProfilePictureUrl = ref(''); // To store the original profile picture URL
const profilePictureError = ref('');
const showFlashMessage = ref(false);
const flashMessageText = ref('');
const selectedProfilePictureFile = ref(null); // Store the selected file temporarily
const fileInputRef = ref(null); // Ref for file input
const showSuccessPopup = ref(false);
const profileUpdated = ref(false);
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

// ** Validations for all form fields **
const isFirstNameValid = computed(() => firstName.value.trim() !== '');
const isLastNameValid = computed(() => lastName.value.trim() !== '');
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)); // Email regex validation
const isUsernameValid = computed(() => username.value.trim() !== '');
const isCountryValid = computed(() => country.value !== '');
const isSalutationValid = computed(() => salutation.value.trim() !== '');
const isGenderValid = computed(() => gender.value !== '');

// Reactive state for the error popup
const showErrorPopup = ref(false);

const fetchUserProfileAndEvents = async () => {
  try {
    // Fetch the logged-in user's profile
    const userData = await fetchUserIdAndRole();
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
      profilePictureId.value = user.value.profilePictureId ?? null;

      // Fetch the profile picture by external ID
      if (profilePictureId.value) {
        try {
          const profilePictureResponse = await axios.get(API_ROUTES.FILES_BY_EXTERNAL_ID(profilePictureId.value), {
            responseType: 'blob', // Ensures it's treated as binary data
          });

          // Convert the blob to an object URL for display
          const imageUrl = URL.createObjectURL(profilePictureResponse.data);
          profilePictureUrl.value = imageUrl;
          originalProfilePictureUrl.value = imageUrl;

        } catch (error) {
          profilePictureError.value = 'Error fetching profile picture';
          console.error("Error fetching profile picture:", error);
        }
      }

      // Fetch the user's events
      const eventsResponse = await axios.get(API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS(userData.id));
      if (eventsResponse && eventsResponse.data && Array.isArray(eventsResponse.data)) {
        events.value = eventsResponse.data;
      } else {
        console.error("No events found or unexpected format.");
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
    await axios.delete(`http://localhost:8080/events/${event.id}`, {withCredentials: true});
    events.value = events.value.filter(e => e.id !== event.id); // Remove event from list
  } catch (error) {
    console.error("Error deleting event:", error);
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

// Update event function
const updateEvent = (index) => {
  const event = paginatedEvents.value[index];
  router.push(`/editevent/${event.id}`); // Assuming you have a route to edit the event
};

// Update profile (including profile picture upload if applicable)
const updateProfile = async () => {

  if (
      !isFirstNameValid.value ||
      !isLastNameValid.value ||
      !isEmailValid.value ||
      !isUsernameValid.value ||
      !isCountryValid.value ||
      !isSalutationValid.value ||
      !isGenderValid.value
  ) {
    // Show error message or handle invalid input
    showErrorPopup.value = true;
    setTimeout(() => {
      showErrorPopup.value = false;
    }, 3000);
    window.scrollTo(0, 0);
    return;
  }

  try {
    let newProfilePictureId = profilePictureId.value;

    // If a new profile picture is selected, upload it
    if (selectedProfilePictureFile.value) {
      const formData = new FormData();
      formData.append("file", selectedProfilePictureFile.value);
      formData.append("fileType", 'PROFILE_PICTURE');
      const uploadResponse = await axios.post(API_ROUTES.MINIO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        'withCredentials': true,
      });

      if (uploadResponse.status === 200) {
        newProfilePictureId = uploadResponse.data; // Store the new external ID
        profilePictureError.value = '';
      } else {
        profilePictureError.value = 'Failed to upload profile picture';
      }
    }

    const formData = {
      firstName: firstName.value,
      lastName: lastName.value,
      salutation: salutation.value,
      gender: gender.value?.toUpperCase() ?? null,
      email: email.value,
      userName: username.value,
      id: store.state.userId,
      countryId: country.value,
      profilePictureId: newProfilePictureId, // Use the new profile picture ID, if uploaded
    };

    const response = await axios.put(API_ROUTES.USERS_BY_ID(formData.id), formData, {
      withCredentials: true,
    });

    user.value = response.data;
    profilePictureId.value = newProfilePictureId;
    showFlashMessage.value = true;
    showSuccessPopup.value = true;
    profileUpdated.value = true;


    window.scrollTo(0, 0);

    setTimeout(() => {
      showFlashMessage.value = false;
      showSuccessPopup.value = false;
    }, 3000);

    // Emit event to update Navbar
    const event = new CustomEvent('profilePictureUpdated', { detail: profilePictureUrl.value });
    window.dispatchEvent(event);


  } catch (error) {
    console.error('Failed to update profile:', error);
    alert('Error updating profile.');
  }
};

// Temporarily store selected file when user selects a new profile picture
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedProfilePictureFile.value = file; // Store the file temporarily
    profilePictureUrl.value = URL.createObjectURL(file); // Display preview
    profileUpdated.value = false;
  } else {
    profilePictureError.value = 'No file selected';
  }
};

// Delete profile picture
const resetProfilePicture = async () => {
  if (!profilePictureId.value) {
    console.error("No profile picture to delete.");
    return;
  }

  try {
    await axios.delete(`${API_ROUTES.MINIO}/${profilePictureId.value}`, {
      withCredentials: true,
    });

    // Clear the profile picture data on the frontend
    profilePictureId.value = '';
    profilePictureUrl.value = '';
    originalProfilePictureUrl.value = '';
    profileUpdated.value = true;
    profilePictureError.value = null;
    selectedProfilePictureFile.value = null;

    console.log("Profile picture deleted successfully.");
  } catch (error) {
    console.error("Failed to delete profile picture:", error);
    profilePictureError.value = 'Error deleting profile picture.';
  }
};

// Reset profile picture to original if the user cancels the update
const resetToOriginalProfilePicture = () => {
  profilePictureUrl.value = originalProfilePictureUrl.value;
  selectedProfilePictureFile.value = null;
  profileUpdated.value = false;
};

// Fetch countries and user profile on component mount
onMounted(async () => {
  countries.value = await CountryService.getCountries();
  await fetchUserProfileAndEvents();
});

// Watch for changes in profilePictureUrl and emit event
watch(profilePictureUrl, (newUrl) => {
  const event = new CustomEvent('profilePictureUpdated', { detail: newUrl });
  window.dispatchEvent(event);
});

// Watch for route leave to reset profile picture if not updated
onBeforeRouteLeave((to, from, next) => {
  if (!profileUpdated.value) {
    resetToOriginalProfilePicture();
  }
  next();
});

</script>


<template>
  <div class="container">
    <h1>My UserProfile</h1>
    <hr>
    <div v-if="showErrorPopup" class="alert alert-danger mt-3" role="alert">
      Enter all the required fields.
    </div>
    <div v-if="showSuccessPopup" class="alert alert-success mt-3" role="alert">
      Profile updated successfully
    </div>
    <div v-if="user">
      <div class="row">
        <div class="col-12 col-md-6">
          <h2>User Profile</h2>
          <form  @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="profilePicture" class="form-label">Profile Picture</label>
              <div class="mt-3">
                <!-- Show the profile picture if available -->
                <div v-if="profilePictureUrl">
                  <img  :src="profilePictureUrl" :alt="user ? user.userName + '\'s Profile Picture' : 'Profile Picture'" class="img-thumbnail profile-picture" width="150">
                  <button v-if="profilePictureId" type="button" class="btn btn-danger mt-2" @click="resetProfilePicture">Delete Picture</button>
                </div>
                <!-- Show error message if there's an error fetching the profile picture -->
                <p v-else-if="profilePictureError" class="text-danger">{{ profilePictureError }}</p>
                <!-- Show message if no profile picture is available -->
                <p v-else>No profile picture available.</p>
              </div>
              <input type="file" class="form-control" id="profilePicture" accept=".jpg, .png, .gif" @change="handleFileUpload" ref="fileInputRef">
            </div>

            <div class="mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input type="text" class="form-control" id="firstName" v-model="firstName" :class="{ 'is-invalid': !isFirstNameValid }">
              <p v-if="!isFirstNameValid" class="text-danger">First name is required.</p>
            </div>
            <div class="mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input type="text" class="form-control" id="lastName" v-model="lastName" :class="{ 'is-invalid': !isLastNameValid }">
              <p v-if="!isLastNameValid" class="text-danger">Last name is required.</p>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="email" :class="{ 'is-invalid': !isEmailValid }">
              <p v-if="!isEmailValid" class="text-danger">Please enter a valid email address.</p>
            </div>
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" v-model="username" :class="{ 'is-invalid': !isUsernameValid }">
              <p v-if="!isUsernameValid" class="text-danger">Username is required.</p>
            </div>
            <div class="mb-3">
              <label for="country" class="form-label">Country</label>
              <select class="form-select" id="country" v-model="country">
                <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
              </select>
              <p v-if="!isCountryValid" class="text-danger">Please select a country.</p>
            </div>
            <div class="mb-3">
              <label for="salutation" class="form-label">Salutation</label>
              <input type="text" class="form-control" id="salutation" v-model="salutation" :class="{ 'is-invalid': !isSalutationValid}">
              <p v-if="!isSalutationValid" class="text-danger">Please enter a salutation.</p>
            </div>
            <div class="mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select class="form-select" id="gender" v-model="gender" :class="{ 'is-invalid': !isGenderValid}">
                <option value="">Select Gender</option>
                <option v-for="option in genderOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <p v-if="!isGenderValid" class="text-danger">Please select a gender.</p>
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
            <EventCard :event="event" />
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
.flash-message {
  color: green;
  font-weight: bold;
}

.profile-picture {
  margin-right: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>