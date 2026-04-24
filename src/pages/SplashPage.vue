<template>
  <div class="splash-page">
    <div class="bg-orb orb-1" />
    <div class="bg-orb orb-2" />

    <div class="content">
      <div class="logo-wrap">
        <div class="logo-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="12" fill="#2563eb"/>
            <path d="M10 28V14c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v14" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 28h15M22 18h2c1.1 0 2 .9 2 2v4c0 .6.4 1 1 1s1-.4 1-1V16l-2-2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="13" y="16" width="6" height="4" rx="1" fill="white"/>
          </svg>
        </div>
        <span class="logo-text">주유조아</span>
      </div>

      <div class="hero">
        <h1 class="hero-title">더 스마트하게<br /><span class="highlight">주유소</span> 찾기</h1>
        <p class="hero-desc">가격, 거리, 경로를 한 번에 비교해<br />가장 합리적인 주유소를 추천해드려요</p>
      </div>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#2563eb"/>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#2563eb" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <span>현위치 반경 검색</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>실시간 가격 비교</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span>경로 최적 추천</span>
        </div>
      </div>

      <div class="action-group">
        <RouterLink to="/login" class="primary-btn">시작하기</RouterLink>
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
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px calc(32px + env(safe-area-inset-bottom));
  background: linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #f8fbff 100%);
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.orb-1 {
  width: 320px;
  height: 320px;
  background: rgba(59, 130, 246, 0.18);
  top: -80px;
  right: -80px;
}

.orb-2 {
  width: 260px;
  height: 260px;
  background: rgba(99, 102, 241, 0.12);
  bottom: 40px;
  left: -60px;
}

.content {
  position: relative;
  width: 100%;
  max-width: 400px;
  z-index: 1;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.logo-icon {
  flex-shrink: 0;
  line-height: 0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.logo-text {
  font-size: 22px;
  font-weight: 900;
  color: var(--color-gray-900);
  letter-spacing: -0.5px;
}

.hero {
  margin-bottom: 32px;
}

.hero-title {
  margin: 0;
  font-size: 38px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -1px;
  color: var(--color-gray-900);
}

.highlight {
  color: var(--color-primary);
}

.hero-desc {
  margin: 16px 0 0;
  color: var(--color-gray-500);
  font-size: 15px;
  line-height: 1.7;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-700);
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 800;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.primary-btn:active,
.secondary-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.primary-btn {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-blue);
}

.secondary-btn {
  background: white;
  color: var(--color-gray-800);
  border: 1.5px solid var(--color-gray-200);
}
</style>
