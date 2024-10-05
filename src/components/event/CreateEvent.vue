<script setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';
import {fetchUserData} from "@/service/authService.js";
import {API_ROUTES} from "@/apiRoutes.js";


const mediaFiles = ref([]);
const selectedTags = ref(new Set());
const createMediaFileIds = ref([]); // To store the IDs of uploaded media files
const parks = ref([]); // Store the list of parks
const selectedParkId = ref('');
const showSuccessPopup = ref(false);

// Fetch parks from the API on component mount
onMounted(async () => {
  try {
    const response = await axios.get(API_ROUTES.PARKS);
    parks.value = response.data;
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
        const response = await axios.post(API_ROUTES.FILES, formData, {
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

// Toggle selection for tags
const toggleTagSelection = (event) => {
  try {
    const tag = event.target.dataset.value;
    if (selectedTags.value.has(tag)) {
      selectedTags.value.delete(tag);
    } else {
      selectedTags.value.add(tag);
    }
  } catch (error) {
    console.error('Error toggling tag selection:', error);
  }
};

// Check if a tag is selected
const isTagSelected = (tag) => selectedTags.value.has(tag);


const submitForm = async (event) => {
  event.preventDefault();

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
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      startTS: document.getElementById('startTime').value, // should be a datetime-local field
      endTS: document.getElementById('lastTime').value, // should be a datetime-local field
      parkId: selectedParkId.value,
      creatorUserId: userId, // Ensure this has the correct userId from the backend
      createMediaFileIds: createMediaFileIds.value, // IDs of uploaded media files
    };

    // Build url
    const url = API_ROUTES.EVENTS_WITH_OPTIONAL_PARAMS(userId, selectedParkId.value);

    // Send the event creation request
    const response = await axios.post(url, formData);

    console.log('Event created successfully:', response.data);

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
        <input type="text" class="form-control" id="title" required>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Event Description</label>
        <textarea class="form-control" id="description" rows="3" required></textarea>
      </div>
      <div class="mb-3">
        <label for="startTime" class="form-label">Start Time</label>
        <input type="datetime-local" class="form-control" id="startTime" required>
      </div>
      <div class="mb-3">
        <label for="lastTime" class="form-label">Last Time</label>
        <input type="datetime-local" class="form-control" id="lastTime" required>
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
              @change="handleFileSelection"
          >
          <button class="btn btn-outline-secondary" type="button" @click="removeAllMediaFiles">
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
        <label for="eventTags" class="form-label">Select Event Tags (Multiple Choices)</label>
        <div class="custom-select">
          <select class="form-select" id="eventTags" multiple>
            <option v-for="tag in ['tag1', 'tag2', 'tag3']" :key="tag" :value="tag">{{ tag }}</option>
          </select>
          <div class="custom-options">
            <div
                v-for="tag in ['tag1', 'tag2', 'tag3']"
                :key="tag"
                :data-value="tag"
                @click="toggleTagSelection"
                :class="{ 'highlighted': isTagSelected(tag) }"
                class="custom-option"
            >
              {{ tag }}
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Create Event</button>
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
</style>
