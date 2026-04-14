<template>
  <section
    ref="sheetRef"
    class="sheet"
    :style="{
      height: sheetHeight + 'px',
      transition: isDragging ? 'none' : 'height 0.3s ease',
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
        <h2 class="sheet-title">주변 주유소</h2>
        <p class="sheet-subtitle">{{ stations.length }}곳 검색됨</p>
      </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
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

const sheetRef = ref<HTMLElement | null>(null)

const MIN_HEIGHT = 160
const getMaxHeight = () => window.innerHeight * 0.78
const getDefaultHeight = () => window.innerHeight * 0.42

const sheetHeight = ref(0)
const isDragging = ref(false)

let dragStartY = 0
let dragStartHeight = 0

onMounted(() => {
  sheetHeight.value = getDefaultHeight()
})

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

  // 드래그 끝난 위치 기준으로 스냅
  const snapMid = (MIN_HEIGHT + getMaxHeight()) / 2
  if (sheetHeight.value < MIN_HEIGHT + 60) {
    // 거의 최소치 → 접힌 상태 고정
    sheetHeight.value = MIN_HEIGHT
  } else if (sheetHeight.value < snapMid) {
    // 중간 아래 → 기본 높이로 스냅
    sheetHeight.value = getDefaultHeight()
  } else {
    // 중간 위 → 최대 높이로 스냅
    sheetHeight.value = getMaxHeight()
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
  min-height: 160px;
  padding: 10px 16px calc(14px + env(safe-area-inset-bottom));
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -12px 30px rgba(17, 24, 39, 0.12);
}

.handle-wrap {
  display: flex;
  justify-content: center;
  padding: 4px 0 12px;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.handle-wrap:active {
  cursor: grabbing;
}

.handle {
  width: 52px;
  height: 5px;
  border-radius: 999px;
  background: #d1d5db;
  transition: background 0.15s;
}

.handle-wrap:hover .handle,
.handle-wrap:active .handle {
  background: #9ca3af;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
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

.station-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 12px;
  margin-top: 14px;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}
</style>
