<template>
  <transition :name="transitionFadeName" mode="out-in">
    <div v-show="isShown" ref="modal" :class="`modal ${isShown?'--shown':''}`" :style="backdropFilter?`-webkit-backdrop-filter:${backdropFilter};backdrop-filter:${backdropFilter};`:''">
      <transition :name="transitionContentName">
        <div v-show="isShown" ref="inner" class="modal__content" :style="`background: ${bgColor}; width: min(${width}, 95%)`">
          <slot name="inner" />
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">

export interface MaskProps {
  bgColor?:string,
  isShown:boolean
  backdropFilter?:string,
  transitionFadeName?:string
  transitionContentName?:string
  width?:string
}

const props = withDefaults(defineProps<MaskProps>(), { bgColor: 'var(--bg-primary)', backdropFilter: '', transitionFadeName: 'no-transition', transitionContentName: 'no-transition', width: '400px' })
const emit = defineEmits<{
    clickOutside:[PointerEvent]
}>()
const isMounted = ref(false)

const inner = ref()
const modal = ref()
onClickOutside(inner, (e) => {
  emit('clickOutside', e)
})
function closeByEsc (e:KeyboardEvent) {
  if (e.key === 'Escape' || e.code === 'Escape') {
    emit('clickOutside', e)
  }
}
onMounted(() => {
  isMounted.value = true
  const $main = document.querySelector('main')
  window.addEventListener('keydown', closeByEsc)
  watch(() => props.isShown, (n, o) => {
    if ($main) {
      if (props.isShown) {
        $main.setAttribute('style', 'touch-action: none;-ms-touch-action: none; pointer-events:none')
      } else {
        $main.setAttribute('style', '')
      }
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', closeByEsc)
})
</script>

<style lang="scss">
@import "assets/styles/components/modal";
</style>
