<template>
  <div class="search-wrap">
    <div class="search-box">
      <span class="icon">🔎</span>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="search-input"
        type="text"
        placeholder="주유소명 또는 지역 검색"
      />
      <button class="filter-button" @click="$emit('open-filter')">
        필터
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'open-filter'): void
}>()
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
  gap: 10px;
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
  backdrop-filter: blur(12px);
}

.icon {
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
}

.filter-button {
  border: 0;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
  padding: 10px 14px;
}
</style>