<template>
  <div class="callback-page">
    <div v-if="error" class="error-wrap">
      <p class="error-msg">{{ error }}</p>
      <RouterLink to="/welcome" class="back-link">처음으로 돌아가기</RouterLink>
    </div>
    <div v-else class="loading-wrap">
      <div class="spinner" />
      <p class="loading-text">로그인 중...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  const token = new URLSearchParams(window.location.search).get('token')
  if (!token) {
    error.value = '토큰을 받지 못했습니다. 다시 시도해주세요.'
    return
  }
  try {
    await auth.loginWithOAuth(token)
    if (auth.hasCompletedInitialProfile.value) {
      router.replace('/app')
    } else {
      router.replace('/initial-profile')
    }
  } catch {
    error.value = '카카오 로그인에 실패했습니다. 다시 시도해주세요.'
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-50);
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--color-gray-500);
  font-size: 15px;
  font-weight: 600;
}

.error-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 24px;
}

.error-msg {
  color: var(--color-danger);
  font-size: 15px;
  font-weight: 600;
}

.back-link {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 700;
}
</style>
