<template>
  <Transition name="sheet">
    <div v-if="station" class="detail-overlay" @click.self="$emit('close')">
      <section class="detail-sheet">
        <div class="handle" />

        <!-- 헤더 -->
        <div class="header-row">
          <div class="header-info">
            <span class="brand-badge">{{ station.brand }}</span>
            <h2 class="station-name">{{ station.name }}</h2>
            <p v-if="station.address" class="address">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ station.address }}
            </p>
          </div>
          <button type="button" class="close-btn" aria-label="닫기" @click="$emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 거리 + 태그 -->
        <div class="meta-row">
          <span v-if="station.distance != null" class="distance-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
            </svg>
            {{ formatDistance(station.distance) }}
          </span>
          <span v-if="station.isSelf" class="tag self">셀프</span>
          <span v-if="station.hasCarWash" class="tag wash">세차</span>
          <span v-if="station.hasStore" class="tag store">편의점</span>
        </div>

        <!-- 가격 -->
        <div class="price-box" :class="fuelType === 'DIESEL' ? 'diesel' : 'gasoline'">
          <span class="price-label">{{ fuelType === 'DIESEL' ? '경유' : '휘발유' }}</span>
          <strong class="price-value">{{ displayPrice.toLocaleString() }}</strong>
          <span class="price-unit">원/L</span>
        </div>

        <!-- 전화번호 -->
        <div v-if="station.tel" class="info-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>{{ station.tel }}</span>
        </div>

        <!-- 경로 미리보기 (route 모드만) -->
        <button
          v-if="mode === 'route' && routeStore.origin && routeStore.destination"
          type="button"
          class="action-btn preview-btn"
          :disabled="isPreviewLoading"
          @click.stop="handlePreview"
        >
          <svg v-if="isPreviewLoading" width="17" height="17" viewBox="0 0 24 24" fill="none" class="spin">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10"/>
          </svg>
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6l9-4 9 4M3 18l9 4 9-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isPreviewLoading ? '경로 계산 중...' : '경로 미리보기' }}
        </button>

        <!-- 내비/전화 아이콘 버튼 그리드 -->
        <div class="navi-grid">
          <a
            class="navi-icon-btn disabled"
            @click.stop
          >
            <span class="navi-icon-wrap phone-wrap">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="navi-icon-label">전화</span>
          </a>

          <button type="button" class="navi-icon-btn disabled" disabled @click.stop.prevent>
            <span class="navi-icon-wrap kakao-wrap">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <polygon points="3,11 22,2 13,21 11,13 3,11" stroke="#3C1E1E" stroke-width="2" stroke-linejoin="round" fill="none"/>
              </svg>
            </span>
            <span class="navi-icon-label">카카오내비</span>
          </button>

          <button
            type="button"
            class="navi-icon-btn"
            :class="{ disabled: isMobile && mode === 'route' }"
            :disabled="isMobile && mode === 'route'"
            :title="isMobile && mode === 'route' ? '경유지 포함 경로는 네이버 지도에서 지원되지 않습니다' : undefined"
            @click.stop.prevent="handleNaverMap"
          >
            <span class="navi-icon-wrap naver-wrap">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <polygon points="3,11 22,2 13,21 11,13 3,11" stroke="white" stroke-width="2" stroke-linejoin="round" fill="none"/>
              </svg>
            </span>
            <span class="navi-icon-label">네이버지도</span>
          </button>

          <button
            type="button"
            class="navi-icon-btn"
            :class="{ disabled: !isMobile }"
            :disabled="!isMobile"
            @click.stop.prevent="handleTmapNavi"
          >
            <span class="navi-icon-wrap tmap-wrap">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <polygon points="3,11 22,2 13,21 11,13 3,11" stroke="white" stroke-width="2" stroke-linejoin="round" fill="none"/>
              </svg>
            </span>
            <span class="navi-icon-label">T map</span>
          </button>
        </div>

        <!-- 미리보기 에러 -->
        <p v-if="previewError" class="preview-error">{{ previewError }}</p>
      </section>
    </div>
  </Transition>

  <!-- 경로 미리보기 팝업 -->
  <RoutePreviewModal
    :show="showPreviewModal"
    :route-path="routeStore.routePath"
    :selected-station="station"
    :origin="routeStore.origin"
    :destination="routeStore.destination"
    :route-summary="routeStore.routeSummary"
    @close="showPreviewModal = false; routeStore.clearPreview()"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { openTmapUrl } from '@/utils/tmapNavi'
import type { GasStation } from '@/types/gasStation'
import { useRouteStore } from '@/stores/route'
import { useAuthStore } from '@/stores/auth'
import RoutePreviewModal from '@/components/RoutePreviewModal.vue'

const routeStore = useRouteStore()
const auth = useAuthStore()
const fuelType = computed(() => auth.profile.value.fuelType ?? 'GASOLINE')
const displayPrice = computed(() => {
  if (!props.station) return 0
  return fuelType.value === 'DIESEL' ? props.station.dieselPrice : props.station.gasolinePrice
})

const props = defineProps<{
  station: GasStation | null
  mode?: 'nearby' | 'route'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'route-ready', path: { lat: number; lng: number }[]): void
}>()

const isPreviewLoading = ref(false)
const previewError = ref('')
const showPreviewModal = ref(false)

async function handlePreview() {
  if (!props.station) return
  isPreviewLoading.value = true
  previewError.value = ''
  try {
    await routeStore.buildFullRoute()
    showPreviewModal.value = true
  } catch (err) {
    previewError.value = err instanceof Error ? err.message : '경로를 불러오지 못했습니다.'
  } finally {
    isPreviewLoading.value = false
  }
}

const BRAND_COLORS: Record<string, { bg: string; color: string }> = {
  SK: { bg: '#fff0e6', color: '#ea580c' },
  GS: { bg: '#fef9c3', color: '#ca8a04' },
  현대: { bg: '#eff6ff', color: '#1d4ed8' },
  S오일: { bg: '#fef2f2', color: '#dc2626' },
  알뜰: { bg: '#f0fdf4', color: '#16a34a' },
}

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || Capacitor.isNativePlatform()
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios')

const brandStyle = computed(() => {
  if (!props.station) return { background: '#f3f4f6', color: '#6b7280' }
  const key = Object.keys(BRAND_COLORS).find((k) => props.station!.brand.includes(k))
  const colors = (key ? BRAND_COLORS[key] : null) ?? { bg: '#f3f4f6', color: '#6b7280' }
  return { background: colors.bg, color: colors.color }
})

function handleKakaoNavi() {
  if (!props.station) return

  const { name, lat, lng } = props.station
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const kakao = window.Kakao
  const destination = props.mode === 'route' ? routeStore.destination : null

  if (!kakao?.Navi || !isMobile) {
    const target = destination
      ? `${encodeURIComponent(destination.name)},${destination.lat},${destination.lng}`
      : `${encodeURIComponent(name)},${lat},${lng}`
    window.open(`https://map.kakao.com/link/to/${target}`, '_blank')
    return
  }

  if (props.mode === 'route' && destination) {
    kakao.Navi.start({
      name: destination.name,
      x: destination.lng,
      y: destination.lat,
      coordType: 'wgs84',
      viaPoints: [{ name, x: lng, y: lat }],
    })
  } else {
    kakao.Navi.start({ name, x: lng, y: lat, coordType: 'wgs84' })
  }
}

function handleTmapNavi() {
  if (!props.station || !isMobile) return

  const { name, lat, lng } = props.station
  const destination = props.mode === 'route' ? routeStore.destination : null
  const startPoint = routeStore.origin ?? (routeStore.currentLocation ? { ...routeStore.currentLocation, name: '출발지' } : null)

  const enc = encodeURIComponent
  let query = ''
  if (startPoint) query += `startX=${startPoint.lng}&startY=${startPoint.lat}&startName=${enc(startPoint.name)}&`
  if (props.mode === 'route' && destination) {
    query += `goalX=${destination.lng}&goalY=${destination.lat}&goalName=${enc(destination.name)}`
    query += `&via1X=${lng}&via1Y=${lat}&via1Name=${enc(name)}`
  } else {
    query += `goalX=${lng}&goalY=${lat}&goalName=${enc(name)}`
  }
  const tmapUrl = `tmap://route?${query}`
  console.log('[TmapNavi] url:', tmapUrl)
  openTmapUrl(tmapUrl)
}

function handleNaverMap() {
  if (!props.station) return

  const { name, lat, lng } = props.station
  const destination = props.mode === 'route' ? routeStore.destination : null
  const startPoint = routeStore.origin ?? routeStore.currentLocation
  const startName = routeStore.origin?.name ?? '출발지'

  const encode = (s: string) => encodeURIComponent(s)
  const toPoint = (p: { lat: number; lng: number }, label: string) =>
    `${p.lng},${p.lat},${encode(label)},-,PLACE_POI`

  if (isMobile && !(props.mode === 'route' && destination)) {
    // 모바일 단순 목적지 이동: nmap:// 앱 스킴으로 바로 열기
    // (nmap:// 스킴은 경유지(via) 파라미터 미지원 → 경유지 있는 경우 웹 URL 사용)
    const params: string[] = []
    if (startPoint) {
      params.push(`slat=${startPoint.lat}`, `slng=${startPoint.lng}`, `sname=${encode(startName)}`)
    }
    params.push(`dlat=${lat}`, `dlng=${lng}`, `dname=${encode(name)}`)
    params.push(`appname=com.example.gasstation`)

    const nmapUrl = `nmap://route/car?${params.join('&')}`

    // 앱 미설치 시 웹으로 폴백
    const webUrl = buildNaverWebUrl()
    const fallbackTimer = setTimeout(() => window.open(webUrl, '_blank'), 1500)
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(fallbackTimer)
    }, { once: true })

    window.location.href = nmapUrl
  } else {
    // 경유지 포함 경로 또는 데스크탑: 웹 URL 사용 (경유지 지원)
    window.open(buildNaverWebUrl(), '_blank')
  }

  function buildNaverWebUrl(): string {
    const start = startPoint ? toPoint(startPoint, startName) : '-'
    if (props.mode === 'route' && destination) {
      // 네이버 지도 웹 URL 형식: start / destination / via(경유지) / car
      return `https://map.naver.com/v5/directions/${start}/${toPoint(destination, destination.name)}/${toPoint({ lat, lng }, name)}/car`
    }
    return `https://map.naver.com/v5/directions/${start}/${toPoint({ lat, lng }, name)}/car`
  }
}

function formatDistance(distance?: number) {
  if (distance == null) return '-'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity var(--transition-base);
}

.sheet-enter-active .detail-sheet,
.sheet-leave-active .detail-sheet {
  transition: transform var(--transition-slow);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .detail-sheet,
.sheet-leave-to .detail-sheet {
  transform: translateY(100%);
}

.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.45);
}

.detail-sheet {
  width: 100%;
  padding: 0 20px calc(80px + env(safe-area-inset-bottom));
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  background: white;
}

.handle {
  width: 44px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  margin: 12px auto 18px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.brand-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 800;
  background: v-bind('brandStyle.background');
  color: v-bind('brandStyle.color');
  margin-bottom: 8px;
}

.station-name {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.4px;
}

.address {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  gap: 4px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--color-gray-100);
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.close-btn:active {
  background: var(--color-gray-200);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
}

.distance-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: #f0f9ff;
  color: #0369a1;
  font-size: 13px;
  font-weight: 700;
}

.tag {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
}

.tag.self {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.tag.wash {
  background: #f0f9ff;
  color: #0369a1;
}

.tag.store {
  background: #fdf4ff;
  color: #7e22ce;
}

.price-box {
  border-radius: var(--radius-lg);
  padding: 14px;
  margin-top: 16px;
}

.price-box.gasoline {
  background: #eff6ff;
}

.price-box.diesel {
  background: #f0fdf4;
}

.price-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-500);
  margin-bottom: 6px;
}

.price-value {
  font-size: 22px;
  font-weight: 900;
  color: var(--color-gray-900);
  letter-spacing: -0.5px;
}

.price-unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-400);
  margin-left: 2px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-gray-50);
  font-size: 14px;
  color: var(--color-gray-700);
}

.info-row svg {
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.action-btn.preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: var(--shadow-blue);
  margin-top: 18px;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.action-btn.preview-btn:active {
  transform: scale(0.98);
}

.action-btn.preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* 내비 아이콘 그리드 */
.navi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.navi-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  padding: 4px 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.navi-icon-btn:active {
  transform: scale(0.92);
}

.navi-icon-btn.disabled {
  opacity: 0.35;
  pointer-events: none;
}

.navi-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-wrap  { background: var(--color-gray-100); color: var(--color-gray-700); }
.kakao-wrap  { background: #FAE100; }
.naver-wrap  { background: #03C75A; }
.tmap-wrap   { background: #E84118; }

.navi-icon-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-gray-600);
  white-space: nowrap;
}

.preview-error {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
</style>
