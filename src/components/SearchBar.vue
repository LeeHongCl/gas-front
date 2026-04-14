<template>
  <div class="search-wrap">
    <div class="search-box" :class="{ focused }">
      <span class="icon">🔍</span>
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
      <!-- 입력값 있을 때만 X 버튼 -->
      <button
        v-if="modelValue"
        class="clear-btn"
        @click="$emit('update:modelValue', '')"
      >
        ✕
      </button>
      <div class="divider" />
      <button class="filter-button" :class="{ 'has-filter': hasFilter }" @click="$emit('open-filter')">
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
  hasFilter?: boolean  // 필터 적용 중일 때 점 표시
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
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 4px 20px rgba(17, 24, 39, 0.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid transparent;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-box.focused {
  border-color: #bfdbfe;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.12);
}

.icon {
  font-size: 15px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #111827;
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-btn {
  border: 0;
  background: #e5e7eb;
  color: #6b7280;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.divider {
  width: 1px;
  height: 18px;
  background: #e5e7eb;
  flex-shrink: 0;
}

.filter-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 0;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 12px;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.filter-button.has-filter {
  background: #2563eb;
  color: white;
}

.filter-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}
</style>
