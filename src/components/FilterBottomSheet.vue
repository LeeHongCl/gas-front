<template>
  <Transition name="overlay">
    <div v-if="open" class="overlay" @click.self="$emit('close')">
      <Transition name="sheet-up">
        <section class="filter-sheet">
          <div class="drag-handle" />

          <div class="sheet-head">
            <h2 class="sheet-title">검색 필터</h2>
            <button class="close-btn" aria-label="닫기" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- 연료 종류 -->
          <div class="section">
            <p class="section-title">연료 종류</p>
            <div class="chip-row">
              <button
                v-for="fuel in fuelOptions"
                :key="fuel.value"
                class="chip"
                :class="{ active: localState.fuelType === fuel.value }"
                @click="localState.fuelType = fuel.value"
              >
                {{ fuel.label }}
              </button>
            </div>
          </div>

          <!-- 정렬 -->
          <div class="section">
            <p class="section-title">정렬 기준</p>
            <div class="chip-row">
              <button
                v-for="sort in sortOptions"
                :key="sort.value"
                class="chip"
                :class="{ active: localState.sortBy === sort.value }"
                @click="localState.sortBy = sort.value"
              >
                {{ sort.label }}
              </button>
            </div>
          </div>

          <!-- 반경 -->
          <div class="section">
            <div class="section-title-row">
              <p class="section-title">검색 반경</p>
              <span class="radius-value">{{ localState.radiusKm }}km</span>
            </div>
            <div class="slider-wrap">
              <input
                v-model="localState.radiusKm"
                type="range"
                min="1"
                max="10"
                class="slider"
                :style="{ '--pct': ((localState.radiusKm - 1) / 9 * 100) + '%' }"
              />
              <div class="slider-labels">
                <span>1km</span>
                <span>5km</span>
                <span>10km</span>
              </div>
            </div>
          </div>

          <!-- 편의시설 토글 -->
          <div class="section">
            <p class="section-title">편의시설</p>
            <div class="toggle-list">
              <label class="toggle-row">
                <span class="toggle-label">셀프 주유만 보기</span>
                <span class="toggle-switch" :class="{ on: localState.onlySelf }" @click="localState.onlySelf = !localState.onlySelf">
                  <span class="toggle-thumb" />
                </span>
              </label>
              <label class="toggle-row">
                <span class="toggle-label">세차 가능</span>
                <span class="toggle-switch" :class="{ on: localState.hasCarWash }" @click="localState.hasCarWash = !localState.hasCarWash">
                  <span class="toggle-thumb" />
                </span>
              </label>
              <label class="toggle-row">
                <span class="toggle-label">편의점 있음</span>
                <span class="toggle-switch" :class="{ on: localState.hasStore }" @click="localState.hasStore = !localState.hasStore">
                  <span class="toggle-thumb" />
                </span>
              </label>
            </div>
          </div>

          <div class="action-row">
            <button class="reset-btn" @click="resetState">초기화</button>
            <button class="apply-btn" @click="apply">적용하기</button>
          </div>
        </section>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { StationFilterState, FuelType } from '@/types/gasStation'

const props = defineProps<{
  open: boolean
  state: StationFilterState
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', value: StationFilterState): void
}>()

const fuelOptions: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: '휘발유' },
  { value: 'diesel', label: '경유' },
]

const sortOptions: { value: 'recommend' | 'distance' | 'price'; label: string }[] = [
  { value: 'recommend', label: '추천순' },
  { value: 'distance', label: '거리순' },
  { value: 'price', label: '가격순' },
]

const localState = reactive<StationFilterState>({ ...props.state })

watch(
  () => props.state,
  (v) => Object.assign(localState, v),
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
  background: rgba(15, 23, 42, 0.45);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: background-color var(--transition-base);
}

.overlay-enter-from,
.overlay-leave-to {
  background-color: transparent;
}

.sheet-up-enter-active,
.sheet-up-leave-active {
  transition: transform var(--transition-slow);
}

.sheet-up-enter-from,
.sheet-up-leave-to {
  transform: translateY(100%);
}

.filter-sheet {
  width: 100%;
  padding: 0 20px calc(24px + env(safe-area-inset-bottom));
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  background: white;
  max-height: 90dvh;
  overflow-y: auto;
}

.drag-handle {
  width: 44px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  margin: 12px auto 0;
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 4px;
}

.sheet-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.4px;
}

.close-btn {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: var(--color-gray-100);
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.close-btn:active {
  background: var(--color-gray-200);
}

.section {
  margin-top: 24px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  color: var(--color-gray-700);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title-row .section-title {
  margin: 0;
}

.radius-value {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-primary);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 10px 18px;
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-full);
  background: white;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-600);
  transition: all var(--transition-fast);
}

.chip:active {
  transform: scale(0.97);
}

.chip.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.slider-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider {
  width: 100%;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) var(--pct),
    var(--color-gray-200) var(--pct),
    var(--color-gray-200) 100%
  );
  outline: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 2.5px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 2.5px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  cursor: pointer;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-gray-400);
  font-weight: 600;
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-gray-100);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 1px solid var(--color-gray-100);
  cursor: pointer;
}

.toggle-row:last-child {
  border-bottom: none;
}

.toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-800);
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--color-gray-200);
  transition: background var(--transition-base);
  flex-shrink: 0;
}

.toggle-switch.on {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform var(--transition-base);
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(20px);
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  margin-top: 28px;
}

.reset-btn {
  height: 54px;
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--color-gray-600);
  font-size: 15px;
  font-weight: 700;
  transition: background var(--transition-fast);
}

.reset-btn:active {
  background: var(--color-gray-50);
}

.apply-btn {
  height: 54px;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: white;
  font-size: 15px;
  font-weight: 800;
  box-shadow: var(--shadow-blue);
  transition: transform var(--transition-fast);
}

.apply-btn:active {
  transform: scale(0.98);
}
</style>
