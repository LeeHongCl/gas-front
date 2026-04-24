<template>
  <div class="favorites-page">
    <div class="page-header">
      <h1 class="page-title">즐겨찾기</h1>
      <p class="page-sub">자주 가는 주유소를 빠르게 찾아보세요</p>
    </div>

    <!-- 빈 상태 -->
    <div v-if="favoriteStations.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#d1d5db" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <p class="empty-title">즐겨찾기가 없습니다</p>
      <p class="empty-desc">주유소 카드의 하트 버튼을 눌러<br />즐겨찾기를 추가해 보세요</p>
      <RouterLink to="/app" class="go-home-btn">주유소 찾으러 가기</RouterLink>
    </div>

    <!-- 카드 목록 -->
    <div v-else class="card-list">
      <p class="count-text"><strong>{{ favoriteStations.length }}곳</strong> 저장됨</p>
      <StationCard
        v-for="station in favoriteStations"
        :key="station.id"
        :station="station"
        @select="selectedStation = $event"
      />
    </div>

    <StationDetailSheet :station="selectedStation" @close="selectedStation = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { gasStations } from '@/data/gasStations'
import type { GasStation } from '@/types/gasStation'

const selectedStation = ref<GasStation | null>(null)

const favoriteStations = computed(() =>
  gasStations
    .filter((s) => s.favorite)
    .map((s, i) => ({ ...s, distance: 1.0 + i * 0.2 })),
)
</script>

<style scoped>
.favorites-page {
  padding: calc(20px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));
}

.page-header {
  margin-bottom: 20px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-gray-700);
}

.empty-desc {
  margin: 0 0 24px;
  color: var(--color-gray-400);
  font-size: 14px;
  line-height: 1.7;
}

.go-home-btn {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 800;
  box-shadow: var(--shadow-blue);
  transition: transform var(--transition-fast);
}

.go-home-btn:active {
  transform: scale(0.97);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.count-text {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--color-gray-500);
}

.count-text strong {
  color: var(--color-primary);
}
</style>
