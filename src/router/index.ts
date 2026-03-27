import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import SplashPage from '@/pages/SplashPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import InitialProfilePage from '@/pages/InitialProfilePage.vue'
import HomePage from '@/pages/HomePage.vue'
import NearbyPage from '@/pages/NearbyPage.vue'
import FavoritesPage from '@/pages/FavoritesPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import MyInfoPage from '@/pages/MyInfoPage.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/welcome' },
    { path: '/welcome', name: 'welcome', component: SplashPage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/signup', name: 'signup', component: SignUpPage },
    {
      path: '/initial-profile',
      name: 'initial-profile',
      component: InitialProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'home', component: HomePage },
        { path: 'nearby', name: 'nearby', component: NearbyPage },
        { path: 'favorites', name: 'favorites', component: FavoritesPage },
        { path: 'settings', name: 'settings', component: SettingsPage },
        { path: 'my-info', name: 'my-info', component: MyInfoPage },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isAuthPage = ['/welcome', '/login', '/signup'].includes(to.path)
  const isInitialProfilePage = to.path === '/initial-profile'
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (needsAuth && !auth.isLoggedIn.value) {
    return '/welcome'
  }

  if (
    auth.isLoggedIn.value &&
    !auth.hasCompletedInitialProfile.value &&
    !isInitialProfilePage
  ) {
    return '/initial-profile'
  }

  if (
    auth.isLoggedIn.value &&
    auth.hasCompletedInitialProfile.value &&
    isInitialProfilePage
  ) {
    return '/app'
  }

  if (
    auth.isLoggedIn.value &&
    auth.hasCompletedInitialProfile.value &&
    isAuthPage
  ) {
    return '/app'
  }

  return true
})

export default router