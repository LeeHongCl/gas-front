<template>
  <div class="fab-group">
    <button class="fab" aria-label="현재 위치로 이동" @click="$emit('recenter')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
    <button class="fab fab-search" aria-label="이 지역 재검색" @click="$emit('research')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>이 지역 검색</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'recenter'): void
  (e: 'research'): void
}>()
</script>

<style scoped>
.fab-group {
  position: absolute;
  right: 16px;
  bottom: 240px;
  z-index: 35;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.fab {
  border: 0;
  border-radius: 14px;
  background: white;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-700);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  min-width: 48px;
  min-height: 48px;
}

.fab:active {
  transform: scale(0.93);
  box-shadow: var(--shadow-sm);
}

.fab-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  background: var(--color-primary);
  color: white;
  font-size: 13px;
  font-weight: 800;
  min-height: 44px;
  box-shadow: var(--shadow-blue);
}
</style>
