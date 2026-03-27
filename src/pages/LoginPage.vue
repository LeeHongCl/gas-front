<template>
  <div class="auth-page">
    <AppHeader title="로그인" subtitle="가입된 계정으로 서비스를 시작하세요" showBack />

    <section class="form-card">
      <label class="field">
        <span>이메일</span>
        <input v-model="email" type="email" placeholder="example@email.com" />
      </label>

      <label class="field">
        <span>비밀번호</span>
        <input v-model="password" type="password" placeholder="비밀번호 입력" />
      </label>

      <button class="primary-btn" @click="handleLogin">로그인</button>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <RouterLink to="/signup" class="text-link">아직 회원이 아니신가요? 회원가입</RouterLink>

      <div class="test-box">
        <strong>테스트 계정</strong>
        <p>1) test1@example.com / 1234 → 초기정보 입력 완료 유저</p>
        <p>2) test2@example.com / 1234 → 초기정보 미입력 유저</p>
        <p>3) test3@example.com / 1234 → 초기정보 입력 완료 유저</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해주세요.'
    return
  }

  try {
    auth.login(email.value, password.value)
    router.push('/app')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '로그인에 실패했습니다.'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100dvh;
  background: #f5f7fb;
}

.form-card {
  margin: 20px 16px 0;
  padding: 20px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
}

.field {
  display: block;
  margin-bottom: 16px;
}

.field span {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.field input {
  width: 100%;
  min-height: 52px;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  padding: 0 14px;
}

.primary-btn {
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 18px;
  background: #2563eb;
  color: white;
  font-weight: 800;
}

.error-text {
  margin-top: 12px;
  color: #dc2626;
  font-weight: 700;
}

.text-link {
  display: block;
  text-align: center;
  margin-top: 14px;
  color: #2563eb;
  font-weight: 700;
}

.test-box {
  margin-top: 20px;
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
}

.test-box strong {
  display: block;
  margin-bottom: 8px;
}

.test-box p {
  margin: 6px 0;
  color: #4b5563;
  font-size: 14px;
}
</style>