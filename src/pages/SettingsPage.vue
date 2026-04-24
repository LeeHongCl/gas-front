<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">설정</h1>
      <p class="page-sub">앱 기본 옵션을 관리합니다</p>
    </div>

    <div class="sections">
      <!-- 검색 설정 -->
      <section class="section-card">
        <h2 class="section-title">검색 설정</h2>

        <div class="setting-row">
          <div>
            <p class="setting-label">기본 연료 종류</p>
            <p class="setting-desc">검색 시 기본으로 사용할 연료를 선택하세요</p>
          </div>
          <div class="chip-row">
            <button
              class="chip"
              :class="{ active: fuelType === 'gasoline' }"
              @click="fuelType = 'gasoline'"
            >휘발유</button>
            <button
              class="chip"
              :class="{ active: fuelType === 'diesel' }"
              @click="fuelType = 'diesel'"
            >경유</button>
          </div>
        </div>

        <div class="divider" />

        <div class="setting-row column">
          <div class="setting-row-top">
            <p class="setting-label">기본 검색 반경</p>
            <span class="setting-value">{{ radius }}km</span>
          </div>
          <input
            v-model="radius"
            type="range"
            min="1"
            max="10"
            class="slider"
            :style="{ '--pct': ((radius - 1) / 9 * 100) + '%' }"
          />
          <div class="slider-labels">
            <span>1km</span>
            <span>5km</span>
            <span>10km</span>
          </div>
        </div>
      </section>

      <!-- 계정 -->
      <section class="menu-card">
        <RouterLink to="/app/my-info" class="menu-item">
          <div class="menu-item-left">
            <span class="menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <div>
              <p class="menu-label">내 정보</p>
              <p class="menu-desc">차종, 연비 등 회원 정보 수정</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </RouterLink>

        <button class="menu-item logout" @click="handleLogout">
          <div class="menu-item-left">
            <span class="menu-icon danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <p class="menu-label danger">로그아웃</p>
          </div>
        </button>
      </section>

      <p class="version-text">주유조아 v1.0.0</p>
    </div>
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
.settings-page {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.page-header {
  padding: calc(20px + env(safe-area-inset-top)) 20px 20px;
}

.page-title {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.page-sub {
  margin: 6px 0 0;
  color: var(--color-gray-400);
  font-size: 13px;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0 16px;
}

.section-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  margin: 0 0 18px;
  font-size: 15px;
  font-weight: 800;
  color: var(--color-gray-800);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.setting-row.column {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.setting-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-800);
}

.setting-desc {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--color-gray-400);
}

.setting-value {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-primary);
}

.chip-row {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.chip {
  padding: 8px 14px;
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-full);
  background: white;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gray-600);
  transition: all var(--transition-fast);
}

.chip.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.slider {
  width: 100%;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) var(--pct),
    var(--color-gray-200) var(--pct),
    var(--color-gray-200) 100%
  );
  outline: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 2.5px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  cursor: pointer;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-gray-400);
  font-weight: 600;
}

.divider {
  height: 1px;
  background: var(--color-gray-100);
  margin: 18px 0;
}

.menu-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 0;
  background: transparent;
  width: 100%;
  text-decoration: none;
  color: var(--color-gray-800);
  border-bottom: 1px solid var(--color-gray-100);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: var(--color-gray-50);
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon.danger {
  background: #fff1f2;
  color: var(--color-danger);
}

.menu-label {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-gray-800);
}

.menu-label.danger {
  color: var(--color-danger);
}

.menu-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-gray-400);
}

.version-text {
  text-align: center;
  font-size: 12px;
  color: var(--color-gray-300);
  margin: 8px 0 0;
}
</style>
