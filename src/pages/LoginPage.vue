<template>
  <div class="auth-page">
    <div class="auth-header">
      <RouterLink to="/welcome" class="back-btn" aria-label="뒤로">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </RouterLink>
    </div>

    <div class="auth-content">
      <div class="auth-title-wrap">
        <h1 class="auth-title">안녕하세요!</h1>
        <p class="auth-subtitle">계속하려면 로그인해 주세요</p>
      </div>

      <div class="form-wrap">
        <label class="field" :class="{ focused: emailFocused }">
          <span class="field-label">이메일</span>
          <div class="input-wrap">
            <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input
              v-model="email"
              type="email"
              placeholder="example@email.com"
              autocomplete="email"
              @focus="emailFocused = true"
              @blur="emailFocused = false"
            />
          </div>
        </label>

        <label class="field" :class="{ focused: pwFocused }">
          <span class="field-label">비밀번호</span>
          <div class="input-wrap">
            <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              placeholder="비밀번호 입력"
              autocomplete="current-password"
              @focus="pwFocused = true"
              @blur="pwFocused = false"
            />
            <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
              <svg v-if="showPw" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </label>

        <Transition name="slide-err">
          <p v-if="errorMessage" class="error-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ errorMessage }}
          </p>
        </Transition>

        <button class="primary-btn" :disabled="loading" @click="handleLogin">
          <span v-if="loading" class="spinner" />
          <span v-else>로그인</span>
        </button>

        <RouterLink to="/signup" class="text-link">
          아직 계정이 없으신가요? <strong>회원가입</strong>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPw = ref(false)
const emailFocused = ref(false)
const pwFocused = ref(false)

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해주세요.'
    return
  }

  loading.value = true
  try {
    auth.login(email.value, password.value)
    router.push('/app')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100dvh;
  background: var(--color-gray-50);
  display: flex;
  flex-direction: column;
}

.auth-header {
  padding: calc(16px + env(safe-area-inset-top)) 16px 0;
}

.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: white;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-700);
  transition: transform var(--transition-fast);
}

.back-btn:active {
  transform: scale(0.95);
}

.auth-content {
  flex: 1;
  padding: 32px 24px calc(32px + env(safe-area-inset-bottom));
}

.auth-title-wrap {
  margin-bottom: 36px;
}

.auth-title {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.8px;
}

.auth-subtitle {
  margin: 8px 0 0;
  color: var(--color-gray-500);
  font-size: 15px;
}

.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  background: white;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.field.focused .input-wrap {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
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

.pw-toggle {
  border: 0;
  background: transparent;
  color: var(--color-gray-400);
  padding: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -6px 0 0;
  color: var(--color-danger);
  font-size: 13px;
  font-weight: 600;
}

.slide-err-enter-active,
.slide-err-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-err-enter-from,
.slide-err-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
  transition: transform var(--transition-fast), opacity var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.primary-btn:active {
  transform: scale(0.98);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text-link {
  display: block;
  text-align: center;
  color: var(--color-gray-500);
  font-size: 14px;
}

.text-link strong {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
