<script setup>
import {computed, onMounted, ref} from 'vue';
import axios from 'axios';
import { fetchUserData } from "@/service/authService.js";
import { useRouter } from 'vue-router';
import { API_ROUTES } from "@/apiRoutes.js";

const router = useRouter();

const props = defineProps({
  eventId: {
    type: String,
    required: true
  }
});

console.log('Event ID:', props.eventId);

const mediaFiles = ref([]);
const selectedTags = ref(new Set());
const updateMediaFileIds = ref([]); // Store new media IDs after upload
const existingMediaExternalIds = ref([]); // Store old media external IDs
const parks = ref([]);
const selectedParkId = ref('');
const showSuccessPopup = ref(false);
const showDeletePopup = ref(false);

const formData = ref({
  title: '',
  description: '',
  startTS: '',
  endTS: '',
  parkId: '',
  creatorUserId: '',
  updateMediaFileIds: [],
  joinedUserIds: [],
  joinedUserNames: [],

});

const showErrorPopup = ref(false);
const titleValidationMessage = ref('');
const descriptionValidationMessage = ref('');
const startDateValidationMessage = ref('');
const endDateValidationMessage = ref('');
const startTimeValidationMessage = ref('');
const endTimeValidationMessage = ref('');

// Validation for Title
const isTitleValid = computed(() => {
  if (formData.value.title.trim() === '') {
    titleValidationMessage.value = 'Title is required.';
    return false;
  }
  titleValidationMessage.value = '';
  return true;
});

// Validation for Description
const isDescriptionValid = computed(() => {
  if (formData.value.description.trim() === '') {
    descriptionValidationMessage.value = 'Description is required.';
    return false;
  }
  descriptionValidationMessage.value = '';
  return true;
});

// Validate Park Selection
const isParkSelected = computed(() => {
  if (!selectedParkId.value) {
    return false; // or set a message if necessary
  }
  return true;
});

const now = new Date();

// Validate Start Date
const isStartDateValid = computed(() => {
  if (!formData.value.startDate) {
    startDateValidationMessage.value = 'Start date is required.';
    return false;
  }
  startDateValidationMessage.value = '';
  return true;
});

// Validate End Date
const isEndDateValid = computed(() => {
  if (!formData.value.endDate) {
    endDateValidationMessage.value = 'End date is required.';
    return false;
  }

  const start = new Date(formData.value.startDate);
  const end = new Date(formData.value.endDate);

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
  if (!formData.value.startTime) {
    startTimeValidationMessage.value = 'Start time is required.';
    return false;
  }

  if (!isStartDateValid.value) {
    startTimeValidationMessage.value = '';
    return false;
  }

  return formData.value.startTime !== '' && startDateValidationMessage.value === '';
});

// Validate End Time
const isEndTimeValid = computed(() => {
  if (!formData.value.endTime) {
    endTimeValidationMessage.value = 'End time is required.';
    return false;
  }

  const start = new Date(`${formData.value.startDate}T${formData.value.startTime}`);
  const end = new Date(`${formData.value.endDate}T${formData.value.endTime}`);
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

const fetchEventData = async () => {
  try {
    const response = await axios.get(API_ROUTES.EVENTS_BY_ID(props.eventId), { withCredentials: true });
    const event = response.data;

    // Extract date and time from startTS and endTS
    const startDateTime = new Date(event.startTS);
    const endDateTime = new Date(event.endTS);

    formData.value = {
      eventId: event.eventId,
      title: event.title,
      description: event.description,
      startDate: startDateTime.toISOString().split('T')[0], // Date part
      startTime: startDateTime.toISOString().split('T')[1].substring(0, 5), // Time part
      endDate: endDateTime.toISOString().split('T')[0], // Date part
      endTime: endDateTime.toISOString().split('T')[1].substring(0, 5), // Time part
      parkId: event.parkId,
      creatorUserId: event.creatorUserId,
      joinedUserIds: event.joinedUserIds,
      joinedUserNames: event.joinedUserNames,
      updateMediaFileIds: event.mediaFileIds
    };
    selectedParkId.value = event.parkId;

    // Store existing media external IDs
    existingMediaExternalIds.value = event.mediaFileExternalIds || [];

    // Fetch and display existing media files based on external IDs
    const mediaResponses = await Promise.all(
        existingMediaExternalIds.value.map(async (id) => {
          const response = await axios.get(`http://localhost:8080/files/${id}`, { responseType: 'blob', withCredentials: true });
          const imageUrl = URL.createObjectURL(response.data);
          return { id, url: imageUrl };
        })
    );
    mediaFiles.value = mediaResponses;
    console.log(mediaFiles.value);
  } catch (error) {
    console.error('Error fetching event data:', error);
  }
};

const deleteExistingMediaFile = async (fileId, index) => {
  if (!fileId) {
    console.error('File ID is not defined');
    return;
  }
  try {
    await axios.delete(`http://localhost:8080/files/${fileId}`, { withCredentials: true });
    mediaFiles.value.splice(index, 1);

    // Remove the deleted file from the existing media external IDs list
    const fileIndex = existingMediaExternalIds.value.indexOf(fileId);
    if (fileIndex > -1) {
      existingMediaExternalIds.value.splice(fileIndex, 1);
    }
  } catch (error) {
    console.error('Error deleting media file:', error.response?.data || error.message);
  }
};

const deleteEvent = async () => {
  try {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    await axios.delete(API_ROUTES.EVENTS_BY_ID(props.eventId), { withCredentials: true });
    showDeletePopup.value = true;

    setTimeout(() => {
      router.push('/eventOverview');
    }, 1000);
  } catch (error) {
    console.error('Error deleting event:', error.response?.data || error.message);
  }
};

onMounted(async () => {
  try {
    const response = await axios.get(API_ROUTES.PARKS, { withCredentials: true });
    parks.value = response.data;
  } catch (error) {
    console.error('Error fetching parks:', error);
  }
  await fetchEventData();
});

const handleFileSelection = (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    file.previewUrl = URL.createObjectURL(file);
    mediaFiles.value.push(file);
  });
};

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

const createObjectURL = (file) => {
  try {
    const url = URL.createObjectURL(file);
    file.previewUrl = url;
    return url;
  } catch (error) {
    console.error('Error creating object URL for file:', error);
  }
};

// Helper function to upload media files to Minio
const uploadMediaFiles = async () => {
  const uploadedIds = [];
  for (const file of mediaFiles.value) {
    if (file.previewUrl) {
      // Upload only new media files (ones with previewUrl)
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(API_ROUTES.MINIO, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedIds.push(response.data); // Collect the uploaded media file IDs
      } catch (error) {
        console.error('Error uploading media file:', error.response?.data || error.message);
      }
    }
  }
  updateMediaFileIds.value = uploadedIds; // Store uploaded media file IDs
};

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

const isTagSelected = (tag) => selectedTags.value.has(tag);

const submitForm = async (event) => {
  event.preventDefault();

  if (
      !isTitleValid.value ||
      !isDescriptionValid.value ||
      !isStartTimeValid.value ||
      !isEndTimeValid.value ||
      !isEndDateValid.value ||
      !isStartDateValid.value ||
      !isStartTimeValid.value ||
      !isParkSelected.value
  ) {
    showErrorPopup.value = true;
    setTimeout(() => {
      showErrorPopup.value = false;
    }, 3000);
    window.scrollTo(0, 0);
    return;
  }

  try {
    if (mediaFiles.value.length > 0) {
      await uploadMediaFiles();
    }

    const userData = await fetchUserData();
    if (!userData || !userData.id) {
      console.error('User is not authenticated.');
      return;
    }

    formData.value.creatorUserId = userData.id;
    formData.value.creatorName = userData.name;

    // Combine the separate date and time into one timestamp
    const startTS = new Date(`${formData.value.startDate}T${formData.value.startTime}`);
    const endTS = new Date(`${formData.value.endDate}T${formData.value.endTime}`);

    // Combine existing and newly uploaded media external IDs
    const allMediaExternalIds = [
      ...existingMediaExternalIds.value,  // Old media IDs from the event
      ...updateMediaFileIds.value         // New media IDs from the upload
    ];

    const updatedEvent = {
      id: props.eventId,
      title: formData.value.title,
      description: formData.value.description,
      startTS: startTS.toISOString(),
      endTS: endTS.toISOString(),
      parkId: selectedParkId.value,
      creatorUserId: formData.value.creatorUserId,
      creatorName: formData.value.creatorName,
      joinedUserIds: formData.value.joinedUserIds || [],
      joinedUserNames: formData.value.joinedUserNames || [],
      mediaFileIds: formData.value.updateMediaFileIds || [],
      mediaFileExternalIds: allMediaExternalIds,  // Combine old and new media external IDs
      eventTagsIds: Array.from(selectedTags.value),
      eventTagNames: [],
    };

    const response = await axios.put(API_ROUTES.EVENTS_BY_ID(props.eventId), updatedEvent, { withCredentials: true });

    // Show the success popup and hide it after 3 seconds
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
    }, 3000); // Hide popup after 3 seconds
    window.scrollTo(0, 0);

  } catch (error) {
    console.error('Error updating event:', error.response?.data || error.message);
  }
};
</script>




<template>
  <div class="container mt-4">
    <h1 class="text-center">Update Event</h1>
    <hr>
    <div v-if="showErrorPopup" class="alert alert-danger mt-3" role="alert">
      Please fill in all required fields before submitting.
    </div>
    <div v-if="showSuccessPopup" class="alert alert-success mt-3" role="alert">
      Event update successful
    </div>
    <form id="updateEventForm" @submit.prevent="submitForm" novalidate>
      <!-- Event Title -->
      <div class="mb-3">
        <label for="title" class="form-label">Event Title</label>
        <input type="text" class="form-control" id="title" v-model="formData.title" :class="{ 'is-invalid': !isTitleValid }">
        <p v-if="!isTitleValid" class="text-danger">{{ titleValidationMessage }}</p> <!-- Validation Message -->
      </div>

      <!-- Event Description -->
      <div class="mb-3">
        <label for="description" class="form-label">Event Description</label>
        <textarea class="form-control" id="description" v-model="formData.description" rows="3" :class="{ 'is-invalid': !isDescriptionValid }"></textarea>
        <p v-if="!isDescriptionValid" class="text-danger">{{ descriptionValidationMessage }}</p> <!-- Validation Message -->
      </div>

      <!-- Start Date -->
      <div class="mb-3">
        <label for="startDate" class="form-label">Start Date</label>
        <input type="date" class="form-control" id="startDate" v-model="formData.startDate" :class="{ 'is-invalid': !isStartDateValid }">
        <p v-if="!isStartDateValid" class="text-danger">{{ startDateValidationMessage }}</p>
      </div>

      <!-- Start Time -->
      <div class="mb-3">
        <label for="startTime" class="form-label">Start Time</label>
        <input type="time" class="form-control" id="startTime" v-model="formData.startTime" :class="{ 'is-invalid': !isStartTimeValid }">
        <p v-if="!isStartTimeValid" class="text-danger">Please select a start time.</p>
      </div>

      <!-- End Date -->
      <div class="mb-3">
        <label for="endDate" class="form-label">End Date</label>
        <input type="date" class="form-control" id="endDate" v-model="formData.endDate" :class="{ 'is-invalid': !isEndDateValid }">
        <p v-if="!isEndDateValid" class="text-danger">{{ endDateValidationMessage }}</p>
      </div>

      <!-- End Time -->
      <div class="mb-3">
        <label for="endTime" class="form-label">End Time</label>
        <input type="time" class="form-control" id="endTime" v-model="formData.endTime" :class="{ 'is-invalid': !isEndTimeValid }">
        <p v-if="!isEndTimeValid" class="text-danger">{{ endTimeValidationMessage }}</p>
      </div>

      <!-- Select Park -->
      <div class="mb-3">
        <label for="park" class="form-label">Select Park</label>
        <select class="form-select" id="park" v-model="selectedParkId" :class="{ 'is-invalid': !isParkSelected }">
          <option value="" disabled>Select a park</option>
          <option v-for="park in parks" :key="park.id" :value="park.id">{{ park.name }}</option>
        </select>
        <p v-if="!isParkSelected" class="text-danger">Please select a park.</p> <!-- Validation Message -->
      </div>
      <div class="mb-3">
        <label for="eventMedia" class="form-label">Event Media (Attachments)</label>
        <div class="input-group mb-3 custom-width-input">
          <input type="file" class="form-control" id="eventMedia" multiple @change="handleFileSelection">
        </div>
        <div class="media-preview">
          <div v-for="(file, index) in mediaFiles" :key="file.id || index" class="file-item">
            <template v-if="file.url || file.previewUrl">
              <img v-if="file.url" :src="file.url" alt="File preview" class="preview-image" />
              <img v-else :src="file.previewUrl" alt="File preview" class="preview-image" />
            </template>
            <button class="btn-tertiary" v-if="file.id" @click="() => deleteExistingMediaFile(file.id, index)">Delete</button>
            <button class="btn-primary" v-else @click="() => removeMediaFile(index)">Remove</button>
          </div>
        </div>
      </div>

      <div class="row text-center mb-3">
        <div class="col-md-6">
          <button type="submit" class="btn btn-primary">Update Event</button>
        </div>
        <div class="col-md-6">
          <button type="button" class="btn btn-tertiary" @click="deleteEvent">Delete Event</button>
        </div>
      </div>
      <div v-if="showSuccessPopup" class="alert alert-success mt-3" role="alert">
        Event updated successfully!
      </div>
      <div v-if="showDeletePopup" class="alert alert-danger mt-3" role="alert">
        Event deleted successfully!
      </div>
    </form>
  </div>
</template>


<style scoped>
.custom-width-input {
  width: auto;
}

.media-preview {
  margin-top: 10px;
}

.media-item {
  margin-bottom: 10px;
}

.img-preview {
  max-width: 100px;
  max-height: 100px;
}

.video-preview {
  max-width: 200px;
}

.custom-width-input {
  width: auto;
}

.media-preview {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Spacing between media items */
}

.file-item {
  position: relative;
  display: inline-block;
  text-align: center;
}

.preview-image {
  width: 150px;  /* Fixed width */
  height: 150px; /* Fixed height */
  object-fit: cover; /* Crops images to fit the specified dimensions */
  border: 1px solid #ddd; /* Optional border for better visibility */
  border-radius: 5px; /* Optional rounded corners */
}

.file-item button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 5px;
}

</style>