<script setup>
import { ref, watch, onUnmounted } from 'vue';

// State to store selected media files and tags
const mediaFiles = ref([]);
const selectedTags = ref(new Set());

// Toggle selection for tags
const toggleTagSelection = (event) => {
  const tag = event.target.dataset.value;
  if (selectedTags.value.has(tag)) {
    selectedTags.value.delete(tag);
  } else {
    selectedTags.value.add(tag);
  }
};

// Check if a tag is selected
const isTagSelected = (tag) => selectedTags.value.has(tag);

// Handle file selection
const handleFileSelection = (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    if (file && !file.previewUrl) {
      createObjectURL(file);
    }
  });
  mediaFiles.value = [...mediaFiles.value, ...files];
};

// Remove a media file from the list
const removeMediaFile = (index) => {
  const file = mediaFiles.value[index];
  if (file.previewUrl) {
    URL.revokeObjectURL(file.previewUrl);
  }
  mediaFiles.value.splice(index, 1);
};

// Remove all media files
const removeAllMediaFiles = () => {
  mediaFiles.value.forEach(file => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
  });
  mediaFiles.value = [];
};

// Create a preview URL for the files
const createObjectURL = (file) => {
  const url = URL.createObjectURL(file);
  file.previewUrl = url;
  return url;
};

// Cleanup object URLs when the component is unmounted
onUnmounted(() => {
  mediaFiles.value.forEach(file => URL.revokeObjectURL(file.previewUrl));
});

// Watch for changes in mediaFiles to update previews
watch(mediaFiles, (newFiles) => {
  newFiles.forEach(file => {
    if (file && !file.previewUrl) {
      createObjectURL(file);
    }
  });
});
</script>

<template>
  <div class="container mt-4">
    <h1 class="text-center">Create Event</h1>
    <hr>
    <form id="editEventForm">
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
        <select class="form-select" id="park" required>
          <option value="park1">Park 1</option>
          <option value="park2">Park 2</option>
          <option value="park3">Park 3</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="joinedUsers" class="form-label">List of Joined Users</label>
        <table class="table table-borderless table-sm">
          <tbody>
          <tr>
            <td>User 1</td>
            <td>User 2</td>
            <!-- Add more user items dynamically if needed -->
          </tr>
          </tbody>
        </table>
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
      <button type="submit" class="btn btn-primary">Update Event</button>
    </form>
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
</style>
