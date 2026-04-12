<template>
  <section class="route-form-card">
    <div class="field-group">
      <label class="field-label">출발지</label>
      <div class="field-row">
        <input
          v-model="originKeyword"
          class="field-input"
          type="text"
          placeholder="예: 반월당, 동대구역"
          @keyup.enter="searchOrigin"
        />
        <button class="field-btn" @click="searchOrigin">
          검색
        </button>
      </div>

      <div v-if="originResults.length > 0" class="result-list">
        <button
          v-for="place in originResults"
          :key="place.id"
          class="result-item"
          @click="selectOrigin(place)"
        >
          <strong>{{ place.name }}</strong>
          <span>{{ place.roadAddress || place.address }}</span>
        </button>
      </div>

      <p v-if="origin" class="selected-text">
        선택됨: {{ origin.name }} ({{ origin.lat.toFixed(4) }}, {{ origin.lng.toFixed(4) }})
      </p>
    </div>

    <div class="field-group">
      <label class="field-label">도착지</label>
      <div class="field-row">
        <input
          v-model="destinationKeyword"
          class="field-input"
          type="text"
          placeholder="예: 금오공대, 대구공항"
          @keyup.enter="searchDestination"
        />
        <button class="field-btn" @click="searchDestination">
          검색
        </button>
      </div>

      <div v-if="destinationResults.length > 0" class="result-list">
        <button
          v-for="place in destinationResults"
          :key="place.id"
          class="result-item"
          @click="selectDestination(place)"
        >
          <strong>{{ place.name }}</strong>
          <span>{{ place.roadAddress || place.address }}</span>
        </button>
      </div>

      <p v-if="destination" class="selected-text">
        선택됨: {{ destination.name }} ({{ destination.lat.toFixed(4) }}, {{ destination.lng.toFixed(4) }})
      </p>
    </div>

    <p v-if="searchError" class="error-text">{{ searchError }}</p>

    <div class="actions">
      <button class="primary-btn" :disabled="loading" @click="$emit('search-route')">
        {{ loading ? '추천 중...' : '경로 추천 받기' }}
      </button>
      <button class="secondary-btn" @click="clearAll">
        초기화
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RoutePoint } from '@/stores/route'
import { searchKakaoPlaces, type KakaoPlaceResult } from '@/utils/kakaoPlaceSearch'

const props = defineProps<{
  origin: RoutePoint | null
  destination: RoutePoint | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update-origin', value: RoutePoint): void
  (e: 'update-destination', value: RoutePoint): void
  (e: 'search-route'): void
  (e: 'clear-route'): void
}>()

const originKeyword = ref('')
const destinationKeyword = ref('')

const originResults = ref<KakaoPlaceResult[]>([])
const destinationResults = ref<KakaoPlaceResult[]>([])
const searchError = ref('')

async function searchOrigin() {
  try {
    searchError.value = ''
    originResults.value = await searchKakaoPlaces(originKeyword.value)
  } catch (error) {
    console.error(error)
    searchError.value =
      error instanceof Error ? error.message : '출발지 검색에 실패했습니다.'
    originResults.value = []
  }
}

async function searchDestination() {
  try {
    searchError.value = ''
    destinationResults.value = await searchKakaoPlaces(destinationKeyword.value)
  } catch (error) {
    console.error(error)
    searchError.value =
      error instanceof Error ? error.message : '도착지 검색에 실패했습니다.'
    destinationResults.value = []
  }
}

function selectOrigin(place: KakaoPlaceResult) {
  emit('update-origin', {
    name: place.name,
    lat: place.lat,
    lng: place.lng,
  })
  originKeyword.value = place.name
  originResults.value = []
}

function selectDestination(place: KakaoPlaceResult) {
  emit('update-destination', {
    name: place.name,
    lat: place.lat,
    lng: place.lng,
  })
  destinationKeyword.value = place.name
  destinationResults.value = []
}

function clearAll() {
  originKeyword.value = ''
  destinationKeyword.value = ''
  originResults.value = []
  destinationResults.value = []
  searchError.value = ''
  emit('clear-route')
}
</script>

<style scoped>
.route-form-card {
  display: grid;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.field-row {
  display: flex;
  gap: 8px;
}

.field-input {
  flex: 1;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: white;
  font-size: 14px;
}

.field-btn,
.primary-btn,
.secondary-btn {
  border: 0;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.field-btn {
  min-width: 72px;
  background: #e5e7eb;
}

.result-list {
  display: grid;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.result-item {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  text-align: left;
}

.result-item span {
  color: #6b7280;
  font-size: 12px;
}

.selected-text {
  margin: 0;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

.error-text {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 10px;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  height: 44px;
}

.primary-btn {
  background: #111827;
  color: white;
}

.secondary-btn {
  background: #f3f4f6;
  color: #111827;
}
</style>