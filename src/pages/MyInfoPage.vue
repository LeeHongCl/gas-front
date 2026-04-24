<template>
  <div class="my-info-page">
    <!-- 프로필 헤더 -->
    <div class="profile-header">
      <div class="avatar">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" fill="white" opacity="0.9"/>
          <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
        </svg>
      </div>
      <div class="profile-info">
        <p class="profile-name">{{ auth.profile.value.name || '사용자' }}</p>
        <p class="profile-email">{{ auth.profile.value.email || '' }}</p>
      </div>
    </div>

    <div class="sections">
      <!-- 차량 정보 -->
      <section class="section-card">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="8" width="22" height="9" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
            <circle cx="7" cy="17" r="2" fill="currentColor"/>
            <circle cx="17" cy="17" r="2" fill="currentColor"/>
          </svg>
          차량 정보
        </h2>

        <label class="field" :class="{ focused: carFocused }">
          <span class="field-label">차종</span>
          <div class="input-wrap">
            <input
              v-model="carModel"
              type="text"
              placeholder="예) 현대 아반떼"
              @focus="carFocused = true"
              @blur="carFocused = false"
            />
          </div>
        </label>

        <label class="field" :class="{ focused: effFocused }">
          <span class="field-label">연비 (km/L)</span>
          <div class="input-wrap">
            <input
              v-model="fuelEfficiency"
              type="number"
              inputmode="decimal"
              placeholder="예) 14.5"
              @focus="effFocused = true"
              @blur="effFocused = false"
            />
            <span class="input-suffix">km/L</span>
          </div>
        </label>

        <Transition name="slide-ok">
          <p v-if="savedMessage" class="saved-msg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ savedMessage }}
          </p>
        </Transition>

        <button class="save-btn" @click="handleSave">저장하기</button>
      </section>

      <!-- 설정 메뉴 -->
      <section class="menu-card">
        <RouterLink to="/app/favorites" class="menu-item">
          <div class="menu-item-left">
            <span class="menu-icon heart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </span>
            <span>즐겨찾기 관리</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </RouterLink>

        <button class="menu-item logout" @click="handleLogout">
          <div class="menu-item-left">
            <span class="menu-icon logout-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <span>로그아웃</span>
          </div>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const carModel = ref('')
const fuelEfficiency = ref('')
const savedMessage = ref('')
const carFocused = ref(false)
const effFocused = ref(false)

watchEffect(() => {
  carModel.value = auth.profile.value.carModel
  fuelEfficiency.value = auth.profile.value.fuelEfficiency
})

function handleSave() {
  auth.updateProfile({ carModel: carModel.value, fuelEfficiency: fuelEfficiency.value })
  savedMessage.value = '저장되었습니다.'
  setTimeout(() => { savedMessage.value = '' }, 2000)
}

function handleLogout() {
  auth.logout()
  router.push('/welcome')
}
</script>

<style scoped>
.my-info-page {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: calc(24px + env(safe-area-inset-top)) 20px 28px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #3b82f6 100%);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.profile-info {}

.profile-name {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.4px;
}

.profile-email {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 20px 16px 0;
}

.section-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 800;
  color: var(--color-gray-800);
}

.section-title svg {
  color: var(--color-primary);
}

.field {
  display: block;
  margin-bottom: 14px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gray-600);
}

.input-wrap {
  display: flex;
  align-items: center;
  padding: 0 14px;
  min-height: 50px;
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: var(--color-gray-50);
  transition: border-color var(--transition-base), background var(--transition-base);
}

.field.focused .input-wrap {
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.input-wrap input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-gray-900);
}

.input-wrap input::placeholder {
  color: var(--color-gray-300);
}

.input-suffix {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.saved-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -4px 0 12px;
  color: var(--color-success);
  font-size: 13px;
  font-weight: 700;
}

.slide-ok-enter-active,
.slide-ok-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.slide-ok-enter-from,
.slide-ok-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.save-btn {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 15px;
  font-weight: 800;
  box-shadow: var(--shadow-blue);
  transition: transform var(--transition-fast);
}

.save-btn:active {
  transform: scale(0.98);
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
  padding: 18px 20px;
  border: 0;
  background: transparent;
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-800);
  text-decoration: none;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon.heart {
  background: #fff1f2;
  color: #e11d48;
}

.menu-icon.logout-icon {
  background: var(--color-gray-100);
  color: var(--color-gray-500);
}

.menu-item.logout {
  color: var(--color-danger);
}

.menu-item.logout .menu-item-left span:last-child {
  color: var(--color-danger);
}
</style>
