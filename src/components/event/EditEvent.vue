<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { fetchUserData } from "@/service/authService.js";
import { useRouter } from 'vue-router';
import { API_ROUTES } from "@/apiRoutes.js"; // Import useRouter

const router = useRouter(); // Initialize router

const props = defineProps({
  eventId: {
    type: String,
    required: true
  }
});

console.log('Event ID:', props.eventId);

const mediaFiles = ref([]);
const selectedTags = ref(new Set());
const updateMediaFileIds = ref([]); // To store the IDs of uploaded media files
const parks = ref([]);
const selectedParkId = ref('');
const showSuccessPopup = ref(false);
const showDeletePopup = ref(false); // Show popup on delete success

// Form data
const formData = ref({
  title: '',
  description: '',
  startTS: '',
  endTS: '',
  parkId: '',
  creatorUserId: '',
  updateMediaFileIds: []
});

// Fetch event data to populate the form
const fetchEventData = async () => {
  try {
    const response = await axios.get(API_ROUTES.EVENTS_BY_ID(props.eventId));
    const event = response.data;
    formData.value = {
      eventId: event.eventId,
      title: event.title,
      description: event.description,
      startTS: event.startTS,
      endTS: event.endTS,
      parkId: event.parkId,
      creatorUserId: event.creatorUserId,
      updateMediaFileIds: event.mediaFileIds
    };
    selectedParkId.value = event.parkId;
  } catch (error) {
    console.error('Error fetching event data:', error);
  }
};

// Delete the event
const deleteEvent = async () => {
  try {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    await axios.delete(API_ROUTES.EVENTS_BY_ID(props.eventId));
    showDeletePopup.value = true;

    // Navigate back to EventOverview.vue after success
    setTimeout(() => {
      router.push('/eventOverview');
    }, 2000);
  } catch (error) {
    console.error('Error deleting event:', error.response?.data || error.message);
  }
};

// Fetch parks from the API on component mount
onMounted(async () => {
  try {
    const response = await axios.get(API_ROUTES.PARKS);
    parks.value = response.data;
  } catch (error) {
    console.error('Error fetching parks:', error);
  }
  await fetchEventData(); // Fetch event data after parks are fetched
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

// Upload media files to the FileController
const uploadMediaFiles = async () => {
  try {
    const promises = mediaFiles.value.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(API_ROUTES.FILES, formData, {
          headers: {'Content-Type': 'multipart/form-data'}
        });
        return response.data;
      } catch (uploadError) {
        console.error('Error uploading file:', file.name, uploadError);
        throw uploadError;
      }
    });

    const fileIds = await Promise.all(promises);
    updateMediaFileIds.value = fileIds;
  } catch (error) {
    console.error('Error uploading media files:', error);
    throw error;
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
    // Upload media files if any
    if (mediaFiles.value.length > 0) {
      await uploadMediaFiles();
    }

    // Fetch the user ID
    const userData = await fetchUserData();
    if (!userData || !userData.id) {
      console.error('User is not authenticated.');
      return;
    }

    formData.value.creatorUserId = userData.id;
    formData.value.creatorName = userData.name; // Add this line if you have the creator name

    // Prepare the updated data
    const updatedEvent = {
      id: props.eventId,
      title: formData.value.title,
      description: formData.value.description,
      startTS: formData.value.startTS,
      endTS: formData.value.endTS,
      parkId: selectedParkId.value,
      creatorUserId: formData.value.creatorUserId,
      creatorName: formData.value.creatorName,
      joinedUserIds: formData.value.joinedUserIds || [],
      mediaFileIds: updateMediaFileIds.value.length ? updateMediaFileIds.value : formData.value.updateMediaFileIds || [],
      eventTagsIds: Array.from(selectedTags.value),
      eventTagNames: [], // Add names here if applicable
    };

    // Send PUT request to update the event
    const response = await axios.put(API_ROUTES.EVENTS_BY_ID(props.eventId), updatedEvent);

    console.log('Event updated successfully:', response.data);

    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
    }, 3000);

    // Navigate back to EventOverview.vue after success
    await router.push('/eventOverview');
  } catch (error) {
    console.error('Error updating event:', error.response?.data || error.message);
  }
};
</script>


<template>
  <div class="container mt-4">
    <h1 class="text-center">Update Event</h1>
    <hr>
    <form id="updateEventForm" @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="title" class="form-label">Event Title</label>
        <input type="text" class="form-control" id="title" v-model="formData.title" required>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Event Description</label>
        <textarea class="form-control" id="description" v-model="formData.description" rows="3" required></textarea>
      </div>
      <div class="mb-3">
        <label for="startTime" class="form-label">Start Time</label>
        <input type="datetime-local" class="form-control" id="startTime" v-model="formData.startTS" required>
      </div>
      <div class="mb-3">
        <label for="lastTime" class="form-label">End Time</label>
        <input type="datetime-local" class="form-control" id="lastTime" v-model="formData.endTS" required>
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
          <input type="file" class="form-control" id="eventMedia" multiple @change="handleFileSelection">
          <button class="btn btn-outline-secondary" type="button" @click="removeAllMediaFiles">Remove All</button>
        </div>
        <div class="media-preview">
          <div v-for="(file, index) in mediaFiles" :key="index" class="file-item">
            <img :src="file.previewUrl" alt="File preview" class="preview-image">
            <button type="button" @click="removeMediaFile(index)">Remove</button>
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
</style>