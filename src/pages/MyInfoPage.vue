<template>
  <div class="simple-page">
    <AppHeader title="내 정보" subtitle="회원 정보를 언제든 수정할 수 있습니다" />

    <section class="settings-group">
      <div class="setting-card">
        <h2>기본 정보</h2>
        <p>이름: {{ auth.profile.value.name || '-' }}</p>
        <p>이메일: {{ auth.profile.value.email || '-' }}</p>
      </div>

      <div class="setting-card">
        <h2>차량 정보 입력</h2>

        <label class="field">
          <span>차종</span>
          <input v-model="carModel" type="text" placeholder="차종 입력" />
        </label>

        <label class="field">
          <span>연비 (km/L)</span>
          <input v-model="fuelEfficiency" type="text" placeholder="연비 입력" />
        </label>

        <button class="primary-btn" @click="handleSave">저장하기</button>
        <p v-if="savedMessage" class="saved-message">{{ savedMessage }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const carModel = ref('')
const fuelEfficiency = ref('')
const savedMessage = ref('')

watchEffect(() => {
  carModel.value = auth.profile.value.carModel
  fuelEfficiency.value = auth.profile.value.fuelEfficiency
})

function handleSave() {
  auth.updateProfile({
    carModel: carModel.value,
    fuelEfficiency: fuelEfficiency.value,
  })

  savedMessage.value = '저장되었습니다.'
  setTimeout(() => {
    savedMessage.value = ''
  }, 1500)
}
</script>

<style scoped>
.simple-page {
  padding-bottom: 24px;
}

.settings-group {
  display: grid;
  gap: 14px;
  margin: 20px 16px 0;
}

.setting-card {
  border-radius: 22px;
  background: white;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
}

.setting-card h2 {
  margin: 0 0 10px;
  font-size: 17px;
}

.setting-card p {
  margin: 8px 0;
  color: #4b5563;
}

.field {
  display: block;
  margin-top: 14px;
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
  margin-top: 18px;
}

.saved-message {
  margin-top: 12px;
  color: #2563eb;
  font-weight: 700;
}
</style>