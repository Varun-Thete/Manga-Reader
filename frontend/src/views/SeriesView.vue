<template>
  <div class="series-view">
    <router-link to="/">&larr; Back to Library</router-link>
    <h2 v-if="comics.length > 0">{{ comics[0].series_name }}</h2>
    <div v-if="loading" class="loading">Loading comics...</div>
    <div v-else class="grid">
      <ComicCard v-for="comic in comics" :key="comic.id" :comic="comic" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ComicCard from '../components/ComicCard.vue';

const route = useRoute();
const comics = ref([]);
const loading = ref(true);

onMounted(async () => {
  const seriesId = route.params.id;
  try {
    const comicsRes = await axios.get(`http://localhost:3000/api/series/${seriesId}/comics`);
    // Ideally, get series name from another endpoint or pass as prop
    comics.value = comicsRes.data;
  } catch (error) {
    console.error("Failed to fetch comics:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.series-view h2 {
  margin-top: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
</style>