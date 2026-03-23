<template>
  <div class="selected-info">
    <template v-if="station">
      <div class="title-row">
        <h2>{{ station.name }}</h2>
        <span class="brand">{{ station.brand }}</span>
      </div>

      <div class="meta" v-if="distanceText || durationText">
        <span v-if="distanceText">{{ distanceText }}</span>
        <span v-if="durationText">{{ durationText }}</span>
      </div>

      <p class="address">{{ station.address }}</p>
      <p class="tel">전화번호: {{ station.tel }}</p>

      <div class="price-box">
        <div class="price-item">
          <span class="label">휘발유</span>
          <span class="value">{{ station.gasolinePrice }}원</span>
        </div>
        <div class="price-item">
          <span class="label">경유</span>
          <span class="value">{{ station.dieselPrice }}원</span>
        </div>
      </div>

      <div class="tags">
        <span v-if="station.isSelf">셀프</span>
        <span v-if="station.hasCarWash">세차 가능</span>
        <span v-if="station.hasStore">편의점</span>
      </div>
    </template>

    <template v-else>
      <div class="empty-box">
        <h2>주유소를 선택해줘</h2>
        <p>왼쪽 목록이나 지도 마커를 클릭하면 상세 정보가 보여.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { GasStation } from '@/types/gasStation'

defineProps<{
  station: GasStation | null
  distanceText?: string
  durationText?: string
}>()
</script>

<style scoped>
.selected-info {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  position: relative;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.title-row h2 {
  margin: 0;
  font-size: 18px;
}

.brand {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.meta {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.meta span {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background-color: #dbeafe;
  color: #1d4ed8;
}

.address,
.tel {
  margin: 8px 0 0;
  font-size: 13px;
  color: #374151;
}

.price-box {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.price-item {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background-color: #f3f4f6;
}

.label {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.value {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
}

.tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags span {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  background-color: #e5e7eb;
}

.empty-box h2 {
  margin: 0;
  font-size: 17px;
}

.empty-box p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6b7280;
}
</style>