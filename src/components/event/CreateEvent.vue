<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import axios from 'axios';
import {fetchUserIdAndRole} from "@/service/authService.js";
import {API_ROUTES} from "@/apiRoutes.js";


const mediaFiles = ref([]);
const selectedTags = ref(new Set());
const customTagInput = ref("");  // New ref for custom tag input
const availableTags = ref([]);   // To store tags fetched from the API
const createMediaFileIds = ref([]); // To store the IDs of uploaded media files
const parks = ref([]); // Store the list of parks
const selectedParkId = ref('');
const showSuccessPopup = ref(false);
const customTags = ref(new Map());
const createdEventId = ref(null);

// Validation Computed Properties
const isParkSelected = computed(() => !!selectedParkId.value);

// Reactive state for the error popup
const showErrorPopup = ref(false);

const now = new Date();

const startDate = ref(now.toISOString().split('T')[0]);
const startTime = ref(new Date(now.getTime() + 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 5));

// Calculate end date and time (2 hours from now)
const endDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const endDate = ref(endDateTime.toISOString().split('T')[0]);
const endTime = ref(endDateTime.toISOString().split('T')[1].substring(0, 5));

// Validation messages
const descriptionValidationMessage = ref('');
const titleValidationMessage = ref('');
const startDateValidationMessage = ref('');
const endDateValidationMessage = ref('');
const endTimeValidationMessage = ref('');
const startTimeValidationMessage = ref('');
const tagValidationMessage = ref('');

// Construct startTS using reactive properties
// Construct startTS and endTS using reactive properties
const startTS = computed(() => `${startDate.value}T${startTime.value}`);
const endTS = computed(() => `${endDate.value}T${endTime.value}`);

const isTagValid = computed(() => {
  const tag = customTagInput.value.trim();

  // Skip validation if the input is empty (but do not allow empty tag addition)
  if (tag === '') {
    tagValidationMessage.value = '';
    return true;
  }

  // Check if the tag length is between 3 and 50 characters
  if (tag.length < 3 || tag.length > 50) {
    tagValidationMessage.value = 'Tag must be between 3 and 50 characters long.';
    return false;
  }

  // Check if the custom tag already exists in the available tags or selected tags
  const tagExistsInAvailableTags = availableTags.value.some(t => t.name.toLowerCase() === tag.toLowerCase());
  const tagExistsInSelectedTags = Array.from(selectedTags.value).some(selectedTag => {
    const foundTag = availableTags.value.find(t => t.id === selectedTag);
    return foundTag && foundTag.name.toLowerCase() === tag.toLowerCase();
  });

  if (tagExistsInAvailableTags || tagExistsInSelectedTags) {
    tagValidationMessage.value = 'This tag already exists or has already been selected.';
    return false;
  }

  tagValidationMessage.value = '';
  return true;
});

const isTitleValid = computed(() => {
  if (title.value.trim() === '') {
    titleValidationMessage.value = 'Title is required.';
    return false;
  }

  if (title.value.length < 3) {
    titleValidationMessage.value = 'Title must be at least 3 characters long.';
    return false;
  }

  if (title.value.length > 250) {
    titleValidationMessage.value = 'Title must be under 250 characters.';
    return false;
  }

  titleValidationMessage.value = '';
  return true;
});

const isDescriptionValid = computed(() => {
  if (description.value.trim() === '') {
    descriptionValidationMessage.value = 'Description is required.';
    return false;
  }

  if (description.value.length > 1000) {
    descriptionValidationMessage.value = 'Description must be under 1000 characters.';
    return false
  }

  descriptionValidationMessage.value = '';
  return true;
});

// Validate Start Date
const isStartDateValid = computed(() => {
  if (!startDate.value) {
    startDateValidationMessage.value = 'Start date is required.';
    return false;
  }
  startDateValidationMessage.value = '';
  return true;
});

// Validate End Date
const isEndDateValid = computed(() => {
  if (!endDate.value) {
    endDateValidationMessage.value = 'End date is required.';
    return false;
  }

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  if (end < start) {
    endDateValidationMessage.value = 'End date must be the same or after the start date.';
    return false;
  }

  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  if (end > oneYearFromNow) {
    endDateValidationMessage.value = 'End date cannot be more than 1 year in the future.';
    return false;
  }

  endDateValidationMessage.value = '';
  return true;
});

// Validate Start Time
const isStartTimeValid = computed(() => {
  if (!startTime.value) {
    startTimeValidationMessage.value = 'Start time is required.';
    return false;
  }

  if (!isStartDateValid.value) {
    startTimeValidationMessage.value = '';
    return false;
  }

  return startTime.value !== '' && startDateValidationMessage.value === '';
});

// Validate End Time
const isEndTimeValid = computed(() => {
  if (!endTime.value) {
    endTimeValidationMessage.value = 'End time is required.';
    return false;
  }

  const start = new Date(`${startDate.value}T${startTime.value}`);
  const end = new Date(`${endDate.value}T${endTime.value}`);
  const duration = (end - start) / (1000 * 60); // Duration in minutes

  if (end <= start) {
    endTimeValidationMessage.value = 'End time must be after start time.';
    return false;
  }
  if (duration < 30) {
    endTimeValidationMessage.value = 'Duration must be at least 30 minutes.';
    return false;
  }

  endTimeValidationMessage.value = '';
  return true;
});

const title = ref('');
const description = ref('');

const resetForm = () => {
  title.value = '';
  description.value = '';
  startDate.value = now.toISOString().split('T')[0];
  startTime.value = new Date(now.getTime() + 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 5);
  endDate.value = endDateTime.toISOString().split('T')[0];
  endTime.value = endDateTime.toISOString().split('T')[1].substring(0, 5);
  selectedParkId.value = '';
  selectedTags.value = new Set();
  customTagInput.value = '';
  mediaFiles.value = [];
  createMediaFileIds.value = [];
};

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
    const response = await axios.get(API_ROUTES.PARKS);
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

      // Check if MIME type is an image to apply FileType.PHOTO
      const mimeType = file.type;
      const fileType = mimeType.startsWith('image/') ? 'PHOTO' : 'OTHER'; // Assuming PHOTO for images, OTHER for anything else
      formData.append('fileType', fileType);

      try {
        const response = await axios.post(API_ROUTES.MINIO, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
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

// Add custom tag
const addCustomTag = async () => {
  const tag = customTagInput.value.trim();

  if (tag === '') {
    tagValidationMessage.value = 'Tag must be between 3 and 50 characters long.';
    return;
  }

  if (!isTagValid.value) {
    return;
  }
  try {
    const response = await axios.post('http://localhost:8080/event-tags', {name: tag}, {withCredentials: true});
    const newTagId = response.data.id;

    selectedTags.value.add(newTagId);
    customTags.value.set(newTagId, tag);  // Store custom tag with its ID

    customTagInput.value = '';
  } catch (error) {
    console.error('Error adding custom tag:', error);
    tagValidationMessage.value = 'Error adding custom tag. Please try again.';
  }
};

const getTagName = (tagId) => {
  // Look for the tag in availableTags
  const foundTag = availableTags.value.find(t => t.id === tagId);
  if (foundTag) {
    return foundTag.name;
  }

  // Look for the tag in customTags
  const customTagName = customTags.value.get(tagId);
  if (customTagName) {
    return customTagName;
  }

  // Return fallback if the tag is not found
  return 'Unknown tag';
};

watch(title, (newValue) => {
  isTitleValid.value;
});


// Check if a tag is selected
const isTagSelected = (tag) => selectedTags.value.has(tag);


const submitForm = async (event) => {
  event.preventDefault();

  // Check if any field is invalid
  if (!isTitleValid.value ||
      !isDescriptionValid.value ||
      !isStartDateValid.value ||
      !isStartTimeValid.value ||
      !isEndDateValid.value ||
      !isEndTimeValid.value ||
      !isParkSelected.value) {

    showErrorPopup.value = true;
    setTimeout(() => {
      showErrorPopup.value = false;
    }, 3000);

    window.scrollTo(0, 0);
    return;
  }

  try {
    // First, upload media files
    await uploadMediaFiles();

    // Function to retrieve userId from the backend
    async function getUserIdFromBackend() {
      // Use fetchUserData to get the user data, including userId
      const userData = await fetchUserIdAndRole();
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

    createdEventId.value = response.data.id;

    //console.log('Event created successfully:', response.data);

    // Show the success popup and hide it after 3 seconds
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
    }, 5000); // Hide popup after 3 seconds

    resetForm();

    window.scrollTo(0, 0);

  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
  }
};

</script>

<template>
  <div class="container mt-4">
    <h1 class="text-center">Create Event</h1>
    <hr>
    <div v-if="showErrorPopup" class="alert alert-danger mt-3" role="alert">
      Please fill in all required fields before submitting.
    </div>
    <div v-if="showSuccessPopup" class="alert alert-success mt-3 d-flex justify-content-between align-items-center" role="alert">
      <span>Event successfully created.</span>
      <router-link
          :to="{ name: 'EventDetail', params: { eventId: createdEventId } }"
          class="btn btn-primary btn-responsive"
      >
        View Event
      </router-link>
    </div>
    <form id="editEventForm" @submit.prevent="submitForm">
      <!-- Event Title -->
      <div class="mb-3">
        <label for="title" class="form-label">Event Title</label>
        <input type="text" class="form-control" id="title" v-model="title" :class="{ 'is-invalid': !isTitleValid }">
        <p v-if="titleValidationMessage" class="text-danger">{{ titleValidationMessage }}</p>
      </div>

      <!-- Event Description -->
      <div class="mb-3">
        <label for="description" class="form-label">Event Description</label>
        <textarea class="form-control" id="description" v-model="description" rows="3" :class="{ 'is-invalid': !isDescriptionValid }"></textarea>
        <p v-if="descriptionValidationMessage" class="text-danger">{{ descriptionValidationMessage }}</p>      </div>

      <!-- Start Date -->
      <div class="mb-3">
        <label for="startDate" class="form-label">Start Date</label>
        <input type="date" class="form-control" id="startDate" v-model="startDate" :class="{ 'is-invalid':!isStartDateValid }">
        <p v-if="startDateValidationMessage" class="text-danger">{{ startDateValidationMessage }}</p>
      </div>

      <!-- Start Time -->
      <div class="mb-3">
        <label for="startTime" class="form-label">Start Time</label>
        <input type="time" class="form-control" id="startTime" v-model="startTime" :class="{ 'is-invalid': !isStartTimeValid }">
        <p v-if="!isStartTimeValid" class="text-danger">{{ startTimeValidationMessage }}</p>
      </div>

      <!-- End Date -->
      <div class="mb-3">
        <label for="endDate" class="form-label">End Date</label>
        <input type="date" class="form-control" id="endDate" v-model="endDate" :class="{ 'is-invalid': !isEndDateValid }">
        <p v-if="!isEndDateValid" class="text-danger">{{ endDateValidationMessage }}</p>
      </div>

      <!-- End Time -->
      <div class="mb-3">
        <label for="endTime" class="form-label">End Time</label>
        <input type="time" class="form-control" id="endTime" v-model="endTime" :class="{ 'is-invalid': !isEndTimeValid}">
        <p v-if="!isEndTimeValid" class="text-danger">{{ endTimeValidationMessage }}</p>
      </div>

      <!-- Park -->
      <div class="mb-3">
        <label for="park" class="form-label">Select Park</label>
        <select class="form-select" id="park" v-model="selectedParkId" :class="{ 'is-invalid': !isParkSelected }">
          <option selected disabled value="">Please select a Park</option>
          <option v-for="park in parks" :key="park.id" :value="park.id">{{ park.name }}</option>
        </select>
        <p v-if="!isParkSelected" class="text-danger">{{ startTimeValidationMessage }}</p>
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
          <!-- Tag Input Field -->
          <input
              type="text"
              v-model="customTagInput"
              placeholder="Add custom tag"
              class="form-control mb-2"
              :class="{ 'is-invalid': !isTagValid}"
          />

          <!-- Validation Error Message -->
          <p v-if="!isTagValid> 0" class="text-danger">{{ tagValidationMessage }}</p>

          <!-- Add Tag Button -->
          <button
              type="button"
              class="btn btn-secondary"
              @click="addCustomTag"
          >
            Add Tag
          </button>
        </div>

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
  </div>
</template>

<style scoped>

@media (max-width: 576px) {
  .btn-responsive {
    padding: 0.25rem 0.5rem; /* Smaller padding for smaller screens */
    font-size: 0.875rem;      /* Smaller font size */
  }
}

.custom-select {
  position: relative;
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

.table-borderless td, .table-borderless th {
  border: none;
}

</style>
