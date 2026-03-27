<template>
  <div class="splash-page">
    <div class="hero-card">
      <span class="badge">GasStation App</span>
      <h1>내 위치 기반으로<br />가장 합리적인 주유소 찾기</h1>
      <p>
        가격, 거리, 내 차량 연비까지 고려해서
        더 효율적인 주유 선택을 도와줍니다.
      </p>

      <div class="action-group">
        <RouterLink to="/login" class="primary-btn">로그인</RouterLink>
        <RouterLink to="/signup" class="secondary-btn">회원가입</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.splash-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #dbeafe 0%, #f8fbff 100%);
}

.hero-card {
  width: 100%;
  max-width: 420px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 40px rgba(17, 24, 39, 0.12);
}

.badge {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
}

.hero-card h1 {
  margin: 16px 0 0;
  font-size: 30px;
  line-height: 1.3;
}

.hero-card p {
  margin: 14px 0 0;
  color: #4b5563;
  font-size: 15px;
}

.action-group {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  border-radius: 18px;
  font-weight: 800;
}

.primary-btn {
  background: #2563eb;
  color: white;
}

.secondary-btn {
  background: white;
  border: 1px solid #dbe2ea;
}
</style>