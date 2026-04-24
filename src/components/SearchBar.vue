<template>
  <div class="search-wrap">
    <div class="search-box" :class="{ focused }">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <input
        ref="inputRef"
        :value="modelValue"
        class="search-input"
        type="text"
        placeholder="주유소명 또는 지역 검색"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="focused = true"
        @blur="focused = false"
      />
      <button
        v-if="modelValue"
        class="clear-btn"
        aria-label="검색어 지우기"
        @click="$emit('update:modelValue', '')"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="divider" />
      <button
        class="filter-button"
        :class="{ 'has-filter': hasFilter }"
        aria-label="필터"
        @click="$emit('open-filter')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span>필터</span>
        <span v-if="hasFilter" class="filter-dot" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  hasFilter?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'open-filter'): void
}>()

const focused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
</script>

<style scoped>
.search-wrap {
  position: absolute;
  top: calc(14px + env(safe-area-inset-top));
  left: 16px;
  right: 16px;
  z-index: 40;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid transparent;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.search-box.focused {
  border-color: #bfdbfe;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.14);
}

.search-icon {
  color: var(--color-gray-400);
  flex-shrink: 0;
  transition: color var(--transition-base);
}

.search-box.focused .search-icon {
  color: var(--color-primary);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-gray-900);
}

.search-input::placeholder {
  color: var(--color-gray-300);
}

.clear-btn {
  border: 0;
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.clear-btn:active {
  background: var(--color-gray-300);
}

.divider {
  width: 1px;
  height: 18px;
  background: var(--color-gray-200);
  flex-shrink: 0;
}

.filter-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 800;
  padding: 6px 10px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.filter-button.has-filter {
  background: var(--color-primary);
  color: white;
}

.filter-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}
</style>
