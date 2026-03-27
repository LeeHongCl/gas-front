<template>
  <div class="simple-page">
    <header class="page-header">
      <h1>설정</h1>
      <p>앱 기본 옵션과 계정 기능을 관리합니다.</p>
    </header>

    <section class="settings-group">
      <div class="setting-card">
        <h2>기본 연료 종류</h2>
        <select v-model="fuelType">
          <option value="gasoline">휘발유</option>
          <option value="diesel">경유</option>
        </select>
      </div>

      <div class="setting-card">
        <h2>기본 반경</h2>
        <input v-model="radius" type="range" min="1" max="10" />
        <p>{{ radius }}km 이내 검색</p>
      </div>

      <RouterLink to="/app/my-info" class="setting-link-card">
        <strong>내 정보 관리</strong>
        <span>차종, 연비 등 회원 정보 수정</span>
      </RouterLink>

      <button class="logout-btn" @click="handleLogout">로그아웃</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const fuelType = ref('gasoline')
const radius = ref(5)

function handleLogout() {
  auth.logout()
  router.push('/welcome')
}
</script>

<style scoped>
.simple-page {
  padding: calc(16px + env(safe-area-inset-top)) 16px 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
}

.page-header p {
  margin: 8px 0 0;
  color: #6b7280;
}

.settings-group {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.setting-card,
.setting-link-card {
  display: block;
  border-radius: 22px;
  background: white;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
}

.setting-card h2 {
  margin: 0 0 10px;
  font-size: 17px;
}

.setting-card select,
.setting-card input[type='range'] {
  width: 100%;
}

.setting-card p,
.setting-link-card span {
  margin: 10px 0 0;
  color: #4b5563;
}

.logout-btn {
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 18px;
  background: #ef4444;
  color: white;
  font-weight: 800;
}
</style>