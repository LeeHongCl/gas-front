import { onMounted, onUnmounted } from 'vue'

export function useNoBodyScroll() {
  onMounted(() => {
    document.body.style.overflow = 'hidden'
  })
  onUnmounted(() => {
    document.body.style.overflow = ''
  })
}
