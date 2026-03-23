<template>
  <div class="search-bar">
    <input
      :value="modelValue"
      type="text"
      placeholder="주유소 이름 검색"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.search-bar {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
}

.search-bar input {
  width: 100%;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}

.search-bar input:focus {
  border-color: #2563eb;
}
</style>