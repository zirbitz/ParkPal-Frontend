<script>
export default {
  name: "PictureViewer",
  props: {
    externalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      imageUrl: null,
      error: null,
    };
  },
  mounted() {
    this.fetchPicture();
  },
  methods: {
    async fetchPicture() {
      try {
        const response = await fetch(`http://localhost:8080/files/${this.externalId}`);
        if (!response.ok) {
          if (response.status === 404) {
            this.error = 'Picture not found (404).';
          } else if (response.status === 500) {
            this.error = 'Internal server error (500).';
          } else {
            this.error = 'An unexpected error occurred.';
          }
          return;
        }
        const blob = await response.blob();
        this.imageUrl = URL.createObjectURL(blob);
      } catch (error) {
        if (error.name === 'TypeError') {
          this.error = 'Server is not reachable.';
        } else {
          this.error = 'Failed to fetch picture.';
        }
        console.error(error);
      }
    }
  }
}
</script>

<template>
  <div>
    <img :src="imageUrl" alt="Picture" v-if="imageUrl" />
    <p v-else-if="error">{{ error }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
img {
  max-width: 100%;
  height: auto;
}
</style>