<script setup>
defineProps({
  id: String,
  question: String,
  answer: String
})
</script>

<template>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#' + id" aria-expanded="true" :aria-controls="id">
        {{ question }}
      </button>
    </h2>
    <div :id="id" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        {{ answer }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>