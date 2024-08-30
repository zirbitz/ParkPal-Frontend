<script setup>
import EventCard from "@/components/event/EventCard.vue";
</script>

<template>
  <div class="container">
    <h1>
      AdminDashboard
    </h1>
    <hr>

    <div class="col">
      <div class="card mb-3">
        <img :src="imageUrl" class="card-img-top" :alt="title">
        <div class="card-body">
          <h3 class="card-title">All Created Events</h3>
          <div class="row row-cols-1 row-cols-md-2 g-4">

            <div class="card">
              <div class="col-2 mt-2">
                <button class="btn btn-primary" type="submit">Delete</button>
              </div>
              <div class="card-body">
                <EventCard></EventCard>
              </div>
            </div>

            <div class="card">
              <div class="col-2 mt-2">
                <button class="btn btn-primary" type="submit">Delete</button>
              </div>
              <div class="card-body">
                <EventCard></EventCard>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class="col">
      <div class="card mb-3">
        <div class="card-body">
          <h3 class="card-title">Uploaded User Media</h3>
          <p class="card-text">All files uploaded by Users:</p>

          <div id="app">
            <table class="table table-bordered">
              <thead>
              <tr>
                <th>Preview</th>
                <th>File Name</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(file, index) in paginatedFiles" :key="index">
                <td>
                  <img v-if="isImage(file)" :src="file.url" class="img-thumbnail" width="100">
                  <video v-if="isVideo(file)" :src="file.url" class="video-preview" width="100" controls></video>
                </td>
                <td>{{ file.name }}</td>
                <td>{{ formatSize(file.size) }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteFile(index)">Delete</button>
                </td>
              </tr>
              </tbody>
            </table>

            <nav aria-label="Page navigation">
              <ul class="pagination">
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

    <div class="col">
      <div class="card mb-3">
        <div class="card-body">
          <h3 class="card-title">All Users</h3>
          <p class="card-text">All registered Users:</p>

          <div id="app">
            <table class="table table-bordered">
              <thead>
              <tr>
                <th>UserName</th>
                <th>email</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(user, index) in paginatedUsers" :key="index">
                <td>{{ user.name }}</td>
                <td>{{ user.email}}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteFile(index)">Delete</button>
                </td>
              </tr>
              </tbody>
            </table>

            <nav aria-label="Page navigation">
              <ul class="pagination">
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

</style>