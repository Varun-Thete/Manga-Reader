<template>
    <div class="comic-card">
        <router-link :to="`/reader/${comic.id}`">
            <img :src="coverUrl" alt="Cover" class="cover-image" @error="onImageError" />
            <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
            </div>
        </router-link>
        <div class="card-info">
            <p>{{ comic.file_name }}</p>
            <div class="actions">
                <router-link :to="`/reader/${comic.id}`" class="btn">Read</router-link>
                <button v-if="comic.current_page > 0" @click="resumeReading" class="btn btn-secondary">Resume</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    comic: {
        type: Object,
        required: true
    }
});

const router = useRouter();

const coverUrl = computed(() => `http://localhost:3000/api/comics/${props.comic.id}/page/0`);

const onImageError = (event) => {
    // In case cover fails to load, show a placeholder
    event.target.src = 'https://via.placeholder.com/180x270.png?text=No+Cover';
};

const progressPercentage = computed(() => {
    if (!props.comic.page_count || props.comic.page_count === 0) return 0;
    // We use current_page + 1 because pages are 0-indexed
    return ((props.comic.current_page + 1) / props.comic.page_count) * 100;
});

const resumeReading = () => {
    router.push({ 
        name: 'reader', 
        params: { id: props.comic.id },
        query: { page: props.comic.current_page }
    });
};
</script>

<style scoped>
.comic-card {
    background-color: var(--card-bg-color);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
}
.cover-image {
    width: 100%;
    height: auto;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    background-color: #333;
}
.progress-bar-container {
    height: 6px;
    background-color: #555;
    width: 100%;
}
.progress-bar {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
}
.card-info {
    padding: 0.8rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.card-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.3;
    /* Truncate long file names */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;  
    overflow: hidden;
}
.actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
}
.btn {
    flex: 1;
    text-align: center;
    background-color: var(--primary-color);
    color: white;
    padding: 6px 10px;
    border-radius: 5px;
    text-decoration: none;
    font-size: 0.85rem;
    border: none;
    cursor: pointer;
}
.btn-secondary {
    background-color: #555;
}
</style>