<template>
  <div class="reader-view" ref="readerEl" @click="handleReaderClick">
    <div class="reader-header">
      <router-link :to="`/series/${comic?.series_id}`">&larr; Back to Series</router-link>
      <span class="comic-title">{{ comic?.file_name }}</span>
      <span>Page {{ currentPage + 1 }} of {{ pages.length }}</span>
    </div>

    <div class="reader-main" :class="{ 'double-page': settings.viewMode === 'double' }">
      <div v-if="loading" class="loading-spinner"></div>
      <template v-else>
        <div v-if="settings.viewMode === 'single'" class="page-container single">
            <img :src="currentPageUrl" @load="onPageLoad" />
        </div>
        <div v-if="settings.viewMode === 'double'" class="page-container double">
            <img v-if="rightPageUrl" :src="rightPageUrl" class="page-right" />
            <img v-if="leftPageUrl" :src="leftPageUrl" class="page-left" />
        </div>
      </template>
    </div>

    <div class="reader-footer">
      <div class="settings">
          <label for="view-mode">Mode:</label>
          <select id="view-mode" v-model="settings.viewMode">
              <option value="single">Single Page</option>
              <option value="double">Double Page</option>
          </select>
      </div>
      <div class="navigation">
        <button @click.stop="prevPage">&lt; Prev</button>
        <input type="range" :min="0" :max="pages.length - 1" v-model.number="currentPage" class="page-slider" @click.stop/>
        <button @click.stop="nextPage">Next &gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { throttle } from 'lodash-es';

const route = useRoute();
const router = useRouter();
const readerEl = ref(null);

const comic = ref(null);
const pages = ref([]);
const currentPage = ref(0);
const loading = ref(true);

const settings = reactive({
  viewMode: 'single', // 'single' or 'double'
});

// --- DATA FETCHING ---
onMounted(async () => {
  const comicId = route.params.id;
  try {
    const [comicRes, pagesRes] = await Promise.all([
      axios.get(`http://localhost:3000/api/comics/${comicId}`),
      axios.get(`http://localhost:3000/api/comics/${comicId}/pages`)
    ]);
    comic.value = comicRes.data;
    pages.value = pagesRes.data;
    
    // Check for page in query param (from 'Resume' button)
    const startPage = parseInt(route.query.page, 10);
    if (!isNaN(startPage) && startPage < pages.value.length) {
        currentPage.value = startPage;
    } else if (comic.value.current_page > 0) {
        currentPage.value = comic.value.current_page;
    }

  } catch (error) {
    console.error("Failed to load comic data:", error);
  }
  
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const onPageLoad = () => {
  loading.value = false;
};

// --- PAGE URLS AND NAVIGATION ---

const getPageUrl = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= pages.value.length) return null;
    return `http://localhost:3000/api/comics/${comic.value.id}/page/${pageIndex}`;
}

const currentPageUrl = computed(() => getPageUrl(currentPage.value));

// For two-page view
const leftPageUrl = computed(() => {
    if (currentPage.value === 0) return null; // Cover page doesn't have a left partner
    return getPageUrl(currentPage.value);
});

const rightPageUrl = computed(() => {
    if (currentPage.value === 0) return getPageUrl(0); // Cover page is on the right
    return getPageUrl(currentPage.value - 1);
});


const nextPage = () => {
    const increment = settings.viewMode === 'double' ? 2 : 1;
    if (currentPage.value < pages.value.length - 1) {
        currentPage.value = Math.min(currentPage.value + increment, pages.value.length - 1);
    }
};

const prevPage = () => {
    const decrement = settings.viewMode === 'double' ? 2 : 1;
    if (currentPage.value > 0) {
        currentPage.value = Math.max(0, currentPage.value - decrement);
    }
};

const handleReaderClick = (event) => {
    const clickX = event.clientX;
    const readerWidth = readerEl.value.clientWidth;
    if (clickX < readerWidth * 0.33) {
        prevPage();
    } else if (clickX > readerWidth * 0.66) {
        nextPage();
    }
};

const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
        prevPage();
    } else if (event.key === 'ArrowRight') {
        nextPage();
    }
};

// --- PROGRESS SAVING ---

const saveProgress = throttle(async (page) => {
    if (!comic.value) return;
    try {
        await axios.post(`http://localhost:3000/api/comics/${comic.value.id}/progress`, {
            currentPage: page
        });
        // Update router query so refresh keeps you on the same page
        router.replace({ query: { page } });
    } catch (error) {
        console.error("Failed to save progress:", error);
    }
}, 2000); // Throttle to save at most once every 2 seconds

watch(currentPage, (newPage) => {
  loading.value = true;
  saveProgress(newPage);
});

</script>

<style scoped>
.reader-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  flex-direction: column;
  color: white;
  z-index: 1000;
}

.reader-header, .reader-footer {
  position: absolute;
  left: 0;
  width: 100%;
  background-color: rgba(0,0,0,0.7);
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  box-sizing: border-box;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.reader-view:hover .reader-header, .reader-view:hover .reader-footer {
    opacity: 1;
}

.reader-header { top: 0; }
.reader-footer { bottom: 0; }

.comic-title {
    font-weight: bold;
}

.reader-main {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.page-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.page-container.double {
    justify-content: space-evenly;
}

.page-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.page-container.double img {
    max-width: 50%;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.navigation button {
  background: var(--primary-color);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}
.page-slider {
  width: 250px;
}
</style>