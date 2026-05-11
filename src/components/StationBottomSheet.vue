<template>
  <section
    ref="sheetRef"
    class="sheet"
    :style="{
      height: sheetHeight + 'px',
      transition: isDragging ? 'none' : 'height 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
    }"
  >
    <!-- 드래그 핸들 -->
    <div
      class="handle-wrap"
      @mousedown="startDrag"
      @touchstart.passive="startDrag"
    >
      <div class="handle" />
    </div>

    <div class="sheet-header">
      <div>
        <h2 class="sheet-title">주유소 목록</h2>
        <p class="sheet-subtitle">{{ stations.length }}곳 검색됨</p>
      </div>
    </div>

    <div class="station-list">
      <div v-if="stations.length === 0" class="empty-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#d1d5db" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" stroke="#d1d5db" stroke-width="2"/>
        </svg>
        <div>
          <p class="empty-hint-title">주변에 주유소가 없습니다</p>
          <p class="empty-hint-sub">검색 반경을 늘리거나 새로고침해 주세요</p>
        </div>
      </div>
      <StationCard
        v-for="(station, index) in stations"
        :key="station.id"
        :station="station"
        :mode="mode"
        :rank="mode === 'route' ? index + 1 : undefined"
        @select="$emit('select-station', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { GasStation } from '@/types/gasStation'
import StationCard from './StationCard.vue'

const props = defineProps<{
  stations: GasStation[]
  expanded: boolean
  mode?: 'radius' | 'route'
  snapHeight?: number
}>()

const emit = defineEmits<{
  (e: 'toggle-expand'): void
  (e: 'select-station', station: GasStation): void
  (e: 'height-change', height: number): void
}>()

const sheetRef = ref<HTMLElement | null>(null)

const MIN_HEIGHT = 88
const getMaxHeight = () => window.innerHeight * 0.78
const getDefaultHeight = () => window.innerHeight * 0.30

const sheetHeight = ref(0)
const isDragging = ref(false)

let dragStartY = 0
let dragStartHeight = 0

onMounted(() => {
  sheetHeight.value = getDefaultHeight()
})

watch(() => props.snapHeight, (h) => {
  if (h != null) sheetHeight.value = h
})

watch(sheetHeight, (h) => emit('height-change', h))

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  dragStartY = 'touches' in e ? e.touches[0]!.clientY : (e as MouseEvent).clientY
  dragStartHeight = sheetHeight.value

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchend', endDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  if ('touches' in e) e.preventDefault()

  const currentY = 'touches' in e ? e.touches[0]!.clientY : (e as MouseEvent).clientY
  const delta = dragStartY - currentY
  const newHeight = Math.min(getMaxHeight(), Math.max(MIN_HEIGHT, dragStartHeight + delta))
  sheetHeight.value = newHeight
}

function endDrag() {
  isDragging.value = false

  const def = getDefaultHeight()
  const max = getMaxHeight()
  if (sheetHeight.value < MIN_HEIGHT + 40) {
    sheetHeight.value = MIN_HEIGHT
  } else if (sheetHeight.value < (def + max) / 2) {
    sheetHeight.value = def
  } else {
    sheetHeight.value = max
  }

  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchend', endDrag)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchend', endDrag)
})

defineExpose({ sheetHeight })
</script>

<style scoped>
.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 45;
  display: flex;
  flex-direction: column;
  min-height: 88px;
  padding: 0 16px 16px;
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8px 32px rgba(17, 24, 39, 0.10);
}

.handle-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 8px;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.handle-wrap:active {
  cursor: grabbing;
}

.handle {
  width: 48px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  transition: background var(--transition-fast);
}

.handle-wrap:hover .handle,
.handle-wrap:active .handle {
  background: var(--color-gray-300);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding-bottom: 8px;
}

.sheet-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.3px;
}

.sheet-subtitle {
  margin: 3px 0 0;
  color: var(--color-gray-400);
  font-size: 12px;
  font-weight: 600;
}

.station-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.empty-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 8px;
  color: var(--color-gray-400);
}

.empty-hint-title {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-600);
}

.empty-hint-sub {
  margin: 0;
  font-size: 12px;
  color: var(--color-gray-400);
}
</style>
