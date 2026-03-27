<template>
  <div class="auth-page">
    <AppHeader
      title="초기 회원 정보 입력"
      subtitle="차종과 연비를 넣으면 더 정확한 추천이 가능합니다"
    />

    <section class="form-card">
      <label class="field">
        <span>차종</span>
        <input v-model="carModel" type="text" placeholder="예: 아반떼, 소나타" />
      </label>

      <label class="field">
        <span>연비 (km/L)</span>
        <input v-model="fuelEfficiency" type="text" placeholder="예: 14.2" />
      </label>

      <button class="primary-btn" @click="handleComplete">입력 완료</button>
      <button class="skip-btn" @click="handleSkip">지금은 건너뛰기</button>
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

const carModel = ref('')
const fuelEfficiency = ref('')

function handleComplete() {
  auth.completeInitialProfile({
    carModel: carModel.value,
    fuelEfficiency: fuelEfficiency.value,
  })

  router.push('/app')
}

function handleSkip() {
  auth.skipInitialProfile()
  router.push('/app')
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

.primary-btn,
.skip-btn {
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 18px;
  font-weight: 800;
}

.primary-btn {
  background: #2563eb;
  color: white;
}

.skip-btn {
  margin-top: 10px;
  background: #f3f4f6;
}
</style>