<script setup>
import {computed, onMounted, ref} from 'vue';
import axios from 'axios';
import {fetchUserData} from "@/service/authService.js";
import {API_ROUTES} from "@/apiRoutes.js";


const mediaFiles = ref([]);
const selectedTags = ref(new Set());
const customTagInput = ref("");  // New ref for custom tag input
const availableTags = ref([]);   // To store tags fetched from the API
const createMediaFileIds = ref([]); // To store the IDs of uploaded media files
const parks = ref([]); // Store the list of parks
const selectedParkId = ref('');
const showSuccessPopup = ref(false);
// Calculate start date and time (1 hour from now)
// Get the current date and time
const now = new Date();

const startDate = ref(now.toISOString().split('T')[0]);
const startTime = ref(new Date(now.getTime() + 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 5));

// Calculate end date and time (2 hours from now)
const endDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const endDate = ref(endDateTime.toISOString().split('T')[0]);
const endTime = ref(endDateTime.toISOString().split('T')[1].substring(0, 5));

// Construct startTS using reactive properties
// Construct startTS and endTS using reactive properties
const startTS = computed(() => `${startDate.value}T${startTime.value}`);
const endTS = computed(() => `${endDate.value}T${endTime.value}`);

const title = ref('');
const description = ref('');

const showErrorModal = ref(false);  // Ref to control the visibility of the error modal
const errorMessage = ref('');

const descriptionLength = computed(() => description.value.length);

// Fetch available event tags from the API
const fetchEventTags = async () => {
  try {
    const response = await axios.get('http://localhost:8080/event-tags');
    availableTags.value = response.data;
  } catch (error) {
    console.error('Error fetching event tags:', error);
  }
};
// Fetch parks from the API on component mount
onMounted(async () => {
  try {
    const response = await axios.get(API_ROUTES.PARKS,{withCredentials: true});
    parks.value = response.data;
    await fetchEventTags();
  } catch (error) {
    console.error('Error fetching parks:', error);
  }
});


// Handle file selection
const handleFileSelection = (event) => {
  try {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file && !file.previewUrl) {
        createObjectURL(file);
      }
    });
    mediaFiles.value = [...mediaFiles.value, ...files];
  } catch (error) {
    console.error('Error handling file selection:', error);
  }
};

// Remove a media file from the list
const removeMediaFile = (index) => {
  try {
    const file = mediaFiles.value[index];
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    mediaFiles.value.splice(index, 1);
  } catch (error) {
    console.error(`Error removing media file at index ${index}:`, error);
  }
};

// Remove all media files
const removeAllMediaFiles = () => {
  try {
    mediaFiles.value.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    mediaFiles.value = [];
  } catch (error) {
    console.error('Error removing all media files:', error);
  }
};

// Create a preview URL for the files
const createObjectURL = (file) => {
  try {
    const url = URL.createObjectURL(file);
    file.previewUrl = url;
    return url;
  } catch (error) {
    console.error('Error creating object URL for file:', error);
  }
};

// Upload media files one by one to the FileController
const uploadMediaFiles = async () => {
  try {
    const promises = mediaFiles.value.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(API_ROUTES.MINIO, formData, {withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // Assuming the response contains the ID of the uploaded file
      } catch (uploadError) {
        console.error('Error uploading file:', file.name, uploadError);
        throw uploadError; // Ensure error propagates to break file upload
      }
    });

    // Await all file uploads and set the IDs to createMediaFileIds
    const fileIds = await Promise.all(promises);
    createMediaFileIds.value = fileIds;
  } catch (error) {
    console.error('Error uploading media files:', error);
    throw error; // Re-throw to handle higher up
  }
};
const toggleTagSelection = (tagId) => {
  if (selectedTags.value.has(tagId)) {
    selectedTags.value.delete(tagId);
  } else {
    selectedTags.value.add(tagId);
  }
};

const addCustomTag = () => {
  const tag = customTagInput.value.trim();

  // Check if the tag length is between 3 and 50 characters
  if (tag.length < 3 || tag.length > 50) {
    // Set error message, clear the input field, and show the error modal
    errorMessage.value = 'Tag must be between 3 and 50 characters long.';
    showErrorModal.value = true;
    customTagInput.value = ''; // Clear the input field
    hideErrorModalAfterDelay();
    return;
  }

  // Check if the custom tag already exists in the available tags or selected tags
  const tagExistsInAvailableTags = availableTags.value.some(t => t.name.toLowerCase() === tag.toLowerCase());
  const tagExistsInSelectedTags = Array.from(selectedTags.value).some(selectedTag => {
    const foundTag = availableTags.value.find(t => t.id === selectedTag);
    return foundTag && foundTag.name.toLowerCase() === tag.toLowerCase();
  });

  if (tagExistsInAvailableTags || tagExistsInSelectedTags) {
    // Set error message, clear the input field, and show the error modal
    errorMessage.value = 'This tag already exists or has already been selected.';
    showErrorModal.value = true;
    customTagInput.value = ''; // Clear the input field
    hideErrorModalAfterDelay();
  } else {
    // Add the custom tag to the selected tags
    selectedTags.value.add(tag);
    customTagInput.value = ''; // Clear the input field
    showErrorModal.value = false; // Hide the error modal if shown previously
  }
};

const hideErrorModalAfterDelay = () => {
  setTimeout(() => {
    showErrorModal.value = false;
    errorMessage.value = ''; // Clear the error message when the modal is hidden
  }, 3000); // Adjust delay time as needed
};

const getTagName = (tag) => {
  // Check if it's an ID from availableTags or a custom tag (string)
  const foundTag = availableTags.value.find(t => t.id === tag);
  return foundTag ? foundTag.name : tag; // If tag is found in availableTags, return its name, else it's a custom tag
};

// Check if a tag is selected
const isTagSelected = (tag) => selectedTags.value.has(tag);

const limitDescriptionLength = () => {
  if (description.value.length > 1000) {
    description.value = description.value.substring(0, 1000);
  }
};

const submitForm = async (event) => {
  event.preventDefault();

  if (description.value.length > 1000) {
    errorMessage.value = 'Description cannot exceed 1000 characters.';
    showErrorModal.value = true;
    hideErrorModalAfterDelay();
    return;
  }

  try {
    // First, upload media files
    await uploadMediaFiles();

    // Function to retrieve userId from the backend
    async function getUserIdFromBackend() {
      // Use fetchUserData to get the user data, including userId
      const userData = await fetchUserData();
      if (userData && userData.id) {
        console.log(userData.id); // Log the userId for debugging
        return userData.id; // Return userId if it exists
      }
      return null; // Return null if no userId is found
    }

    // Get the userId from the backend
    const userId = await getUserIdFromBackend();

    if (!userId) {
      console.error('User is not authenticated or userId is not available.');
      return; // Exit early if no userId is found
    }


    // Prepare the data to match CreateEventDto
    const formData = {
      title: title.value,
      description: description.value,
      startTS: startTS.value,
      endTS: endTS.value,
      parkId: selectedParkId.value,
      creatorUserId: userId,
      mediaFileExternalIds: createMediaFileIds.value,
      eventTagsIds: Array.from(selectedTags.value),
    };

    const url = API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS(userId, selectedParkId.value);

    // Send the event creation request
    const response = await axios.post(url, formData, {withCredentials: true});

    //console.log('Event created successfully:', response.data);

    // Show the success popup and hide it after 3 seconds
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
    }, 3000); // Hide popup after 3 seconds

  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
  }
};

</script>

<template>
  <div class="container mt-4">
    <h1 class="text-center">Create Event</h1>
    <hr>
    <form id="editEventForm" @submit.prevent="submitForm">
    <div class="mb-3">
        <label for="title" class="form-label">Event Title</label>
        <input type="text" class="form-control" id="title" v-model="title" required>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Event Description</label>
        <textarea class="form-control" id="description" v-model="description" rows="3" required  @input="limitDescriptionLength"></textarea>
        <p class="text-muted">
          {{ descriptionLength }}/1000 characters
        </p>
        <p v-if="showErrorModal" class="text-danger mt-1">{{ errorMessage }}</p>
      </div>
      <div class="mb-3">
        <label for="startDate" class="form-label">Start Date</label>
        <input type="date" class="form-control" id="startDate" v-model="startDate" required>
      </div>
      <div class="mb-3">
        <label for="startTime" class="form-label">Start Time</label>
        <input type="time" class="form-control" id="startTime" v-model="startTime" required>
      </div>
      <div class="mb-3">
        <label for="endDate" class="form-label">End Date</label>
        <input type="date" class="form-control" id="endDate" v-model="endDate" required>
      </div>
      <div class="mb-3">
        <label for="endTime" class="form-label">End Time</label>
        <input type="time" class="form-control" id="endTime" v-model="endTime" required>
      </div>
      <div class="mb-3">
        <label for="park" class="form-label">Select Park</label>
        <select class="form-select" id="park" v-model="selectedParkId" required>
          <option v-for="park in parks" :key="park.id" :value="park.id">{{ park.name }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="eventMedia" class="form-label">List of Event Media (Attachments)</label>
        <div class="input-group mb-3 custom-width-input">
          <input
              type="file"
              class="form-control"
              id="eventMedia"
              multiple
              accept=".jpg, .png, .gif"
              @change="handleFileSelection"
          >
          <button class="btn btn-tertiary" type="button" @click="removeAllMediaFiles">
            Remove All
          </button>
        </div>
        <div class="media-preview">
          <div v-for="(file, index) in mediaFiles" :key="index" class="media-item">
            <div v-if="file.type.startsWith('image/')">
              <img :src="file.previewUrl" :alt="file.name" class="img-preview">
            </div>
            <div v-else-if="file.type.startsWith('video/')">
              <video :src="file.previewUrl" controls class="video-preview"></video>
            </div>
            <p>{{ file.name }}</p>
            <button class="btn btn-outline-danger btn-sm" @click="removeMediaFile(index)">
              Remove
            </button>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="eventTags" class="form-label">Select Event Tags</label>
        <div class="custom-select">
          <select class="form-select" id="eventTags" @change="toggleTagSelection($event.target.value)" multiple>
            <option v-for="tag in availableTags" :key="tag.id" :value="tag.id" :selected="isTagSelected(tag.id)">
              {{ tag.name }}
            </option>
          </select>
        </div>

        <!-- Custom Tag Input -->
        <div class="mt-2">
          <input type="text" v-model="customTagInput" placeholder="Add custom tag" class="form-control mb-2">
          <button type="button" class="btn btn-secondary" @click="addCustomTag">Add Tag</button>
        </div>

        <p v-if="showErrorModal" class="text-danger mt-1">{{ errorMessage }}</p>

        <!-- Display selected tags -->
        <div class="selected-tags mt-2">
          <span v-for="tag in Array.from(selectedTags)" :key="tag" class="badge bg-primary me-2">
            {{ getTagName(tag) }}
            <button type="button" class="btn-close btn-close-white" @click="toggleTagSelection(tag)"></button>
          </span>
        </div>
      </div>

      <button type="submit" class="btn btn-primary mb-5" @keydown.enter.prevent>Create Event</button>
    </form>

    <div v-if="showSuccessPopup" class="popup">
      <div class="popup-content">
        <p>Event created successfully!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.highlighted {
  background-color: #d3d3d3; /* Light gray background for highlighted items */
  cursor: pointer;
}

.custom-option {
  padding: 5px;
  border: 1px solid #ccc;
  margin: 2px 0;
}

.custom-select {
  position: relative;
}

.custom-options {
  margin-top: 5px;
}

.table td {
  vertical-align: middle;
}

.media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.media-item {
  position: relative;
  max-width: 150px;
}

.img-preview {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
}

.video-preview {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
}

.popup {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #28a745;
  color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 16px;
}

.popup-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-borderless td, .table-borderless th {
  border: none;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}
.modal-body{
  border: red;
}
.modal {
  z-index: 5000;
}
</style>
