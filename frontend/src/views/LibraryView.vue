<template>
  <div class="library-view">
    <h2>My Library</h2>
    <div v-if="loading" class="loading">Loading series...</div>
    <div v-else class="grid">
      <router-link v-for="series in seriesList" :key="series.id" :to="`/series/${series.id}`" class="series-card">
        <div class="card-content">
          <h3>{{ series.name }}</h3>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const seriesList = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/series');
    seriesList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch series:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}
.series-card {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
}
.series-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
}
.card-content h3 {
  margin: 0;
  font-size: 1.2rem;
}
</style>