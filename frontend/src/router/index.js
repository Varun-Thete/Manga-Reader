import { createRouter, createWebHistory } from 'vue-router'
import LibraryView from '../views/LibraryView.vue'
import SeriesView from '../views/SeriesView.vue'
import ReaderView from '../views/ReaderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'library',
      component: LibraryView
    },
    {
      path: '/series/:id',
      name: 'series',
      component: SeriesView,
      props: true
    },
    {
      path: '/reader/:id',
      name: 'reader',
      component: ReaderView,
      props: true
    }
  ]
})

export default router