<template>
  <div class="setup-page">
    <div class="setup-header">
      <div class="setup-icon">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="12" fill="#2563eb"/>
          <path d="M10 28V14c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v14" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 28h15M22 18h2c1.1 0 2 .9 2 2v4c0 .6.4 1 1 1s1-.4 1-1V16l-2-2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="13" y="16" width="6" height="4" rx="1" fill="white"/>
        </svg>
      </div>
      <h1 class="setup-title">차량 정보 입력</h1>
      <p class="setup-desc">연비를 입력하면 주유 비용을 정확하게<br/>계산해 드릴 수 있어요</p>
    </div>

    <div class="form-wrap">
      <label class="field" :class="{ focused: carFocused }">
        <span class="field-label">차종</span>
        <div class="input-wrap">
          <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="9" width="22" height="8" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
            <circle cx="7" cy="17" r="2" fill="currentColor"/>
            <circle cx="17" cy="17" r="2" fill="currentColor"/>
          </svg>
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
        <span class="field-label">연비</span>
        <div class="input-wrap">
          <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 16l4-6 4 4 3-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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

      <button class="primary-btn" @click="handleComplete">입력 완료</button>
      <button class="skip-btn" @click="handleSkip">지금은 건너뛰기</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const carModel = ref('')
const fuelEfficiency = ref('')
const carFocused = ref(false)
const effFocused = ref(false)

function handleComplete() {
  auth.completeInitialProfile({ carModel: carModel.value, fuelEfficiency: fuelEfficiency.value })
  router.push('/app')
}

function handleSkip() {
  auth.skipInitialProfile()
  router.push('/app')
}
</script>

<style scoped>
.setup-page {
  min-height: 100dvh;
  background: var(--color-gray-50);
  padding: calc(40px + env(safe-area-inset-top)) 24px calc(32px + env(safe-area-inset-bottom));
}

.setup-header {
  text-align: center;
  margin-bottom: 40px;
}

.setup-icon {
  display: inline-flex;
  margin-bottom: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-blue);
  line-height: 0;
}

.setup-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.6px;
}

.setup-desc {
  margin: 0;
  color: var(--color-gray-500);
  font-size: 15px;
  line-height: 1.7;
}

.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  border-radius: var(--radius-2xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.field {
  display: block;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-700);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  min-height: 54px;
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  background: var(--color-gray-50);
  transition: border-color var(--transition-base), background var(--transition-base);
}

.field.focused .input-wrap {
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.field-icon {
  color: var(--color-gray-400);
  flex-shrink: 0;
  transition: color var(--transition-base);
}

.field.focused .field-icon {
  color: var(--color-primary);
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

.primary-btn {
  width: 100%;
  min-height: 56px;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 800;
  box-shadow: var(--shadow-blue);
  margin-top: 8px;
  transition: transform var(--transition-fast);
}

.primary-btn:active {
  transform: scale(0.98);
}

.skip-btn {
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-gray-400);
  font-size: 14px;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.skip-btn:active {
  color: var(--color-gray-600);
}
</style>
