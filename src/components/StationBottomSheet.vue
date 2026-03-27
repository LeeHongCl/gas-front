<template>
  <section class="sheet" :class="expanded ? 'expanded' : ''">
    <div class="handle-wrap" @click="$emit('toggle-expand')">
      <div class="handle"></div>
    </div>

    <div class="sheet-header">
      <div>
        <h2 class="sheet-title">주변 주유소</h2>
        <p class="sheet-subtitle">{{ stations.length }}곳 검색됨</p>
      </div>
      <button class="expand-btn" @click="$emit('toggle-expand')">
        {{ expanded ? '접기' : '더보기' }}
      </button>
    </div>

    <div class="station-list">
      <StationCard
        v-for="station in stations"
        :key="station.id"
        :station="station"
        @select="$emit('select-station', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GasStation } from '@/types/gasStation'
import StationCard from './StationCard.vue'

defineProps<{
  stations: GasStation[]
  expanded: boolean
}>()

defineEmits<{
  (e: 'toggle-expand'): void
  (e: 'select-station', station: GasStation): void
}>()
</script>

<style scoped>
.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 45;
  min-height: 220px;
  max-height: 42dvh;
  padding: 10px 16px calc(14px + env(safe-area-inset-bottom));
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -12px 30px rgba(17, 24, 39, 0.12);
  transition: max-height 0.2s ease;
}

.sheet.expanded {
  max-height: 70dvh;
}

.handle-wrap {
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

.handle {
  width: 52px;
  height: 5px;
  border-radius: 999px;
  background: #d1d5db;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sheet-title {
  margin: 0;
  font-size: 20px;
}

.sheet-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.expand-btn {
  border: 0;
  border-radius: 12px;
  background: #f3f4f6;
  padding: 10px 12px;
  font-weight: 700;
}

.station-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  overflow-y: auto;
  max-height: calc(70dvh - 100px);
  padding-bottom: 8px;
}
</style>