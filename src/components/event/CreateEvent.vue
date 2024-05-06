<script setup>

</script>

<template>
  <div class="container mt-4">
  <!-- Create Event Form Goes Here -->
  <h2 class="text-center">Edit Event</h2>
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
        <!-- Add options for park names -->
        <option value="park1">Park 1</option>
        <option value="park2">Park 2</option>
        <option value="park3">Park 3</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="joinedUsers" class="form-label">List of Joined Users</label>
      <!-- Display list of joined users in a borderless table -->
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
      <!-- Display list of event media with option to add or remove -->
      <div class="input-group mb-3 custom-width-input">
        <input type="file" class="form-control" id="eventMedia" multiple>
        <button class="btn btn-outline-secondary" type="button">Remove</button>
      </div>
      <!-- Display the list of attached media in a borderless table -->
      <table class="table table-borderless table-sm">
        <tbody>
        <tr>
          <td>Media 1</td>
          <td>Media 2</td>
          <!-- Add more media items dynamically if needed -->
        </tr>
        </tbody>
      </table>
    </div>
    <div class="mb-3">
      <label for="eventTags" class="form-label">Select Event Tags (Multiple Choices)</label>
      <div class="custom-select">
        <select class="form-select" id="eventTags" multiple>
          <!-- Add options for event tags -->
          <option value="tag1">Tag 1</option>
          <option value="tag2">Tag 2</option>
          <option value="tag3">Tag 3</option>
        </select>
        <div class="custom-options">
          <div class="custom-option">Tag 1</div>
          <div class="custom-option">Tag 2</div>
          <div class="custom-option">Tag 3</div>
          <!-- Add more options dynamically if needed -->
        </div>
      </div>
    </div>
    <!-- ... other form fields ... -->
    <button type="submit" class="btn btn-primary">Update Event</button>
  </form>
  </div>
</template>

<style scoped>
@import '@/assets/css/event/create-event.css';

</style>