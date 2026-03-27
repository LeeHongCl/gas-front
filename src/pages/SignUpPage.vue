<template>
  <div class="auth-page">
    <AppHeader title="회원가입" subtitle="기본 계정을 먼저 만들어주세요" showBack />

    <section class="form-card">
      <label class="field">
        <span>이름</span>
        <input v-model="name" type="text" placeholder="이름 입력" />
      </label>

      <label class="field">
        <span>이메일</span>
        <input v-model="email" type="email" placeholder="example@email.com" />
      </label>

      <label class="field">
        <span>비밀번호</span>
        <input v-model="password" type="password" placeholder="비밀번호 입력" />
      </label>

      <button class="primary-btn" @click="handleSignUp">회원가입 완료</button>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

function handleSignUp() {
  errorMessage.value = ''

  if (!name.value || !email.value || !password.value) {
    errorMessage.value = '모든 항목을 입력해주세요.'
    return
  }

  try {
    auth.signUp({
      name: name.value,
      email: email.value,
      password: password.value,
    })

    router.push('/initial-profile')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '회원가입에 실패했습니다.'
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
</style>