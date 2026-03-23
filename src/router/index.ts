import { createRouter, createWebHistory } from 'vue-router'
import MapPage from '@/views/MapPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map',
      component: MapPage,
    },
  ],
})

export default router