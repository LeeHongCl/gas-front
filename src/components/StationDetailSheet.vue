<template>
  <div v-if="station" class="detail-overlay" @click.self="$emit('close')">
    <section class="detail-sheet">
      <div class="handle"></div>
      <div class="header-row">
        <div>
          <h2>{{ station.name }}</h2>
          <p>{{ station.brand }} · {{ station.address }}</p>
        </div>
        <button class="close-btn" @click="$emit('close')">닫기</button>
      </div>

      <div class="price-grid">
        <div class="info-box">
          <span>휘발유</span>
          <strong>{{ station.gasolinePrice.toLocaleString() }}원</strong>
        </div>
        <div class="info-box">
          <span>경유</span>
          <strong>{{ station.dieselPrice.toLocaleString() }}원</strong>
        </div>
      </div>

      <div class="tag-row">
        <span v-if="station.isSelf" class="tag">셀프</span>
        <span v-if="station.hasCarWash" class="tag">세차 가능</span>
        <span v-if="station.hasStore" class="tag">편의점 있음</span>
      </div>

      <div class="info-list">
        <div class="info-item">전화번호: {{ station.tel }}</div>
        <div class="info-item">거리: {{ formatDistance(station.distance) }}</div>
      </div>

      <div class="action-row">
        <a class="secondary-btn" :href="`tel:${station.tel}`">전화</a>
        <button class="primary-btn">길찾기</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GasStation } from '@/types/gasStation'

defineProps<{
  station: GasStation | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

function formatDistance(distance?: number) {
  if (distance == null) return '-'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}
</script>

<style scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.35);
}

.detail-sheet {
  width: 100%;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background: white;
}

.handle {
  width: 52px;
  height: 5px;
  border-radius: 999px;
  background: #d1d5db;
  margin: 0 auto 14px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.header-row h2 {
  margin: 0;
}

.header-row p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.close-btn,
.secondary-btn,
.primary-btn {
  border: 0;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 700;
}

.price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.info-box {
  border-radius: 18px;
  background: #f8fafc;
  padding: 14px;
}

.info-box span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 6px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag {
  padding: 7px 11px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.info-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.info-item {
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.primary-btn {
  color: white;
  background: #2563eb;
}
</style>