<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <section class="filter-sheet">
      <div class="sheet-head">
        <h2>필터</h2>
        <button class="close-btn" @click="$emit('close')">닫기</button>
      </div>

      <div class="section">
        <label class="section-title">연료 종류</label>
        <div class="option-row">
          <button
            class="chip"
            :class="{ active: localState.fuelType === 'gasoline' }"
            @click="localState.fuelType = 'gasoline'"
          >
            휘발유
          </button>
          <button
            class="chip"
            :class="{ active: localState.fuelType === 'diesel' }"
            @click="localState.fuelType = 'diesel'"
          >
            경유
          </button>
        </div>
      </div>

      <div class="section">
        <label class="section-title">정렬</label>
        <select v-model="localState.sortBy" class="select-box">
          <option value="recommend">추천순</option>
          <option value="distance">거리순</option>
          <option value="price">가격순</option>
        </select>
      </div>

      <div class="section">
        <label class="section-title">반경: {{ localState.radiusKm }}km</label>
        <input v-model="localState.radiusKm" type="range" min="1" max="10" />
      </div>

      <div class="section toggles">
        <label><input v-model="localState.onlySelf" type="checkbox" /> 셀프만 보기</label>
        <label><input v-model="localState.hasCarWash" type="checkbox" /> 세차 가능</label>
        <label><input v-model="localState.hasStore" type="checkbox" /> 편의점 있음</label>
      </div>

      <div class="action-row">
        <button class="secondary" @click="resetState">초기화</button>
        <button class="primary" @click="apply">적용하기</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { StationFilterState } from '@/types/gasStation'

const props = defineProps<{
  open: boolean
  state: StationFilterState
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', value: StationFilterState): void
}>()

const localState = reactive<StationFilterState>({ ...props.state })

watch(
  () => props.state,
  (newValue) => {
    Object.assign(localState, newValue)
  },
  { deep: true },
)

function resetState() {
  Object.assign(localState, {
    fuelType: 'gasoline',
    sortBy: 'recommend',
    onlySelf: false,
    hasCarWash: false,
    hasStore: false,
    radiusKm: 5,
  })
}

function apply() {
  emit('apply', { ...localState })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.35);
}

.filter-sheet {
  width: 100%;
  padding: 20px 16px calc(22px + env(safe-area-inset-bottom));
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background: white;
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn,
.secondary,
.primary,
.chip {
  border: 0;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 700;
}

.section {
  margin-top: 18px;
}

.section-title {
  display: block;
  margin-bottom: 10px;
  font-weight: 800;
}

.option-row {
  display: flex;
  gap: 10px;
}

.chip {
  background: #f3f4f6;
}

.chip.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.select-box {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
}

.toggles {
  display: grid;
  gap: 12px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.secondary {
  background: #f3f4f6;
}

.primary {
  color: white;
  background: #2563eb;
}
</style>