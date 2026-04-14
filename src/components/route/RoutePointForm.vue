<template>
  <section class="route-form-card">

    <!-- ── 출발지 ── -->
    <div class="field-group">
      <div class="field-header">
        <label class="field-label">출발지</label>
        <!-- 입력 방식 탭 -->
        <div class="mode-tabs">
          <button
            class="mode-tab"
            :class="{ active: originMode === 'search' }"
            @click="originMode = 'search'"
          >장소 검색</button>
          <button
            class="mode-tab"
            :class="{ active: originMode === 'address' }"
            @click="originMode = 'address'"
          >주소 입력</button>
          <button
            class="mode-tab"
            :class="{ active: originMode === 'current' }"
            @click="setCurrentLocation"
          >
            {{ gettingLocation ? '위치 가져오는 중...' : '📍 현재 위치' }}
          </button>
        </div>
      </div>

      <!-- 장소 검색 모드 -->
      <template v-if="originMode === 'search'">
        <div class="field-row">
          <input
            v-model="originKeyword"
            class="field-input"
            type="text"
            placeholder="예: 반월당, 동대구역"
            @keyup.enter="searchOrigin"
          />
          <button class="field-btn" :disabled="!originKeyword" @click="searchOrigin">검색</button>
        </div>
        <div v-if="originResults.length > 0" class="result-list">
          <button
            v-for="place in originResults"
            :key="place.id"
            class="result-item"
            @click="selectOriginFromPlace(place)"
          >
            <strong>{{ place.name }}</strong>
            <span>{{ place.roadAddress || place.address }}</span>
          </button>
        </div>
      </template>

      <!-- 주소 직접 입력 모드 -->
      <template v-else-if="originMode === 'address'">
        <div class="field-row">
          <input
            v-model="originAddress"
            class="field-input"
            type="text"
            placeholder="예: 대구 중구 동성로 1"
            @keyup.enter="geocodeOrigin"
          />
          <button class="field-btn" :disabled="!originAddress || geocodingOrigin" @click="geocodeOrigin">
            {{ geocodingOrigin ? '...' : '확인' }}
          </button>
        </div>
        <p v-if="originAddressError" class="error-text">{{ originAddressError }}</p>
      </template>

      <!-- 선택 완료 표시 -->
      <div v-if="origin" class="selected-badge">
        <span class="selected-icon">✓</span>
        <span class="selected-name">{{ origin.name }}</span>
        <button class="selected-clear" @click="clearOrigin">✕</button>
      </div>
    </div>

    <!-- ── 도착지 ── -->
    <div class="field-group">
      <div class="field-header">
        <label class="field-label">도착지</label>
        <div class="mode-tabs">
          <button
            class="mode-tab"
            :class="{ active: destinationMode === 'search' }"
            @click="destinationMode = 'search'"
          >장소 검색</button>
          <button
            class="mode-tab"
            :class="{ active: destinationMode === 'address' }"
            @click="destinationMode = 'address'"
          >주소 입력</button>
        </div>
      </div>

      <!-- 장소 검색 모드 -->
      <template v-if="destinationMode === 'search'">
        <div class="field-row">
          <input
            v-model="destinationKeyword"
            class="field-input"
            type="text"
            placeholder="예: 금오공대, 대구공항"
            @keyup.enter="searchDestination"
          />
          <button class="field-btn" :disabled="!destinationKeyword" @click="searchDestination">검색</button>
        </div>
        <div v-if="destinationResults.length > 0" class="result-list">
          <button
            v-for="place in destinationResults"
            :key="place.id"
            class="result-item"
            @click="selectDestinationFromPlace(place)"
          >
            <strong>{{ place.name }}</strong>
            <span>{{ place.roadAddress || place.address }}</span>
          </button>
        </div>
      </template>

      <!-- 주소 직접 입력 모드 -->
      <template v-else>
        <div class="field-row">
          <input
            v-model="destinationAddress"
            class="field-input"
            type="text"
            placeholder="예: 대구 북구 대학로 80"
            @keyup.enter="geocodeDestination"
          />
          <button class="field-btn" :disabled="!destinationAddress || geocodingDestination" @click="geocodeDestination">
            {{ geocodingDestination ? '...' : '확인' }}
          </button>
        </div>
        <p v-if="destinationAddressError" class="error-text">{{ destinationAddressError }}</p>
      </template>

      <!-- 선택 완료 표시 -->
      <div v-if="destination" class="selected-badge">
        <span class="selected-icon">✓</span>
        <span class="selected-name">{{ destination.name }}</span>
        <button class="selected-clear" @click="clearDestination">✕</button>
      </div>
    </div>

    <p v-if="searchError" class="error-text">{{ searchError }}</p>

    <div class="actions">
      <button
        class="primary-btn"
        :disabled="loading || !origin || !destination"
        @click="$emit('search-route')"
      >
        {{ loading ? '추천 중...' : '경로 추천 받기' }}
      </button>
      <button class="secondary-btn" @click="clearAll">초기화</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RoutePoint } from '@/stores/route'
import { searchKakaoPlaces, type KakaoPlaceResult } from '@/utils/kakaoPlaceSearch'
import { geocodeAddress } from '@/utils/kakaoGeocode'
import { getAppCurrentLocation } from '@/utils/location'

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

// ── 모드 ──────────────────────────────────────────
type InputMode = 'search' | 'address' | 'current'
const originMode = ref<InputMode>('search')
const destinationMode = ref<'search' | 'address'>('search')

// ── 장소 검색 ─────────────────────────────────────
const originKeyword = ref('')
const destinationKeyword = ref('')
const originResults = ref<KakaoPlaceResult[]>([])
const destinationResults = ref<KakaoPlaceResult[]>([])
const searchError = ref('')

async function searchOrigin() {
  if (!originKeyword.value.trim()) return
  try {
    searchError.value = ''
    originResults.value = await searchKakaoPlaces(originKeyword.value)
    if (originResults.value.length === 0) searchError.value = '검색 결과가 없습니다.'
  } catch (e) {
    searchError.value = e instanceof Error ? e.message : '출발지 검색 실패'
    originResults.value = []
  }
}

async function searchDestination() {
  if (!destinationKeyword.value.trim()) return
  try {
    searchError.value = ''
    destinationResults.value = await searchKakaoPlaces(destinationKeyword.value)
    if (destinationResults.value.length === 0) searchError.value = '검색 결과가 없습니다.'
  } catch (e) {
    searchError.value = e instanceof Error ? e.message : '도착지 검색 실패'
    destinationResults.value = []
  }
}

function selectOriginFromPlace(place: KakaoPlaceResult) {
  emit('update-origin', { name: place.name, lat: place.lat, lng: place.lng })
  originKeyword.value = place.name
  originResults.value = []
}

function selectDestinationFromPlace(place: KakaoPlaceResult) {
  emit('update-destination', { name: place.name, lat: place.lat, lng: place.lng })
  destinationKeyword.value = place.name
  destinationResults.value = []
}

// ── 주소 직접 입력 ────────────────────────────────
const originAddress = ref('')
const destinationAddress = ref('')
const originAddressError = ref('')
const destinationAddressError = ref('')
const geocodingOrigin = ref(false)
const geocodingDestination = ref(false)

async function geocodeOrigin() {
  if (!originAddress.value.trim()) return
  geocodingOrigin.value = true
  originAddressError.value = ''
  try {
    const result = await geocodeAddress(originAddress.value)
    if (!result) {
      originAddressError.value = '주소를 찾을 수 없습니다. 도로명 주소를 정확히 입력해주세요.'
      return
    }
    emit('update-origin', { name: originAddress.value, lat: result.lat, lng: result.lng })
  } catch (e) {
    originAddressError.value = e instanceof Error ? e.message : '주소 변환 실패'
  } finally {
    geocodingOrigin.value = false
  }
}

async function geocodeDestination() {
  if (!destinationAddress.value.trim()) return
  geocodingDestination.value = true
  destinationAddressError.value = ''
  try {
    const result = await geocodeAddress(destinationAddress.value)
    if (!result) {
      destinationAddressError.value = '주소를 찾을 수 없습니다. 도로명 주소를 정확히 입력해주세요.'
      return
    }
    emit('update-destination', { name: destinationAddress.value, lat: result.lat, lng: result.lng })
  } catch (e) {
    destinationAddressError.value = e instanceof Error ? e.message : '주소 변환 실패'
  } finally {
    geocodingDestination.value = false
  }
}

// ── 현재 위치 ─────────────────────────────────────
const gettingLocation = ref(false)

async function setCurrentLocation() {
  gettingLocation.value = true
  try {
    const loc = await getAppCurrentLocation()
    emit('update-origin', { name: '현재 위치', lat: loc.lat, lng: loc.lng })
    originMode.value = 'current'
  } catch (e) {
    searchError.value = '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.'
  } finally {
    gettingLocation.value = false
  }
}

// ── 초기화 ────────────────────────────────────────
function clearOrigin() {
  originKeyword.value = ''
  originAddress.value = ''
  originResults.value = []
  originAddressError.value = ''
  originMode.value = 'search'
  emit('clear-route')
}

function clearDestination() {
  destinationKeyword.value = ''
  destinationAddress.value = ''
  destinationResults.value = []
  destinationAddressError.value = ''
  destinationMode.value = 'search'
  emit('update-destination', { name: '', lat: 0, lng: 0 })
}

function clearAll() {
  clearOrigin()
  clearDestination()
  searchError.value = ''
  emit('clear-route')
}
</script>

<style scoped>
.route-form-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  flex-shrink: 0;
}

/* 입력 방식 탭 */
.mode-tabs {
  display: flex;
  gap: 4px;
}

.mode-tab {
  border: 0;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.mode-tab.active {
  background: #dbeafe;
  color: #1d4ed8;
}

/* 입력 행 */
.field-row {
  display: flex;
  gap: 8px;
}

.field-input {
  flex: 1;
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #93c5fd;
}

.field-btn {
  min-width: 60px;
  height: 42px;
  border: 0;
  border-radius: 12px;
  background: #e5e7eb;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.field-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.field-btn:not(:disabled):active {
  background: #d1d5db;
}

/* 검색 결과 리스트 */
.result-list {
  display: grid;
  gap: 6px;
  max-height: 160px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.result-item {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.result-item:active {
  background: #f0f9ff;
}

.result-item strong {
  font-size: 14px;
  color: #111827;
}

.result-item span {
  font-size: 12px;
  color: #6b7280;
}

/* 선택 완료 뱃지 */
.selected-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #eff6ff;
}

.selected-icon {
  font-size: 13px;
  font-weight: 800;
  color: #2563eb;
  flex-shrink: 0;
}

.selected-name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-clear {
  border: 0;
  background: transparent;
  color: #93c5fd;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

/* 에러 */
.error-text {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #dc2626;
}

/* 액션 버튼 */
.actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  height: 46px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.primary-btn {
  background: #111827;
  color: white;
}

.primary-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.primary-btn:not(:disabled):active {
  transform: scale(0.98);
}

.secondary-btn {
  background: #f3f4f6;
  color: #111827;
}

.secondary-btn:active {
  background: #e5e7eb;
}
</style>
