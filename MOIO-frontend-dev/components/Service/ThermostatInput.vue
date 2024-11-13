<template>
  <div ref="thermostat" class="thermostat-input">
    <input
      id="range"
      v-model="p"
      type="range"
      :min="min"
      :max="max"
      :step="step||1"
      hidden
    >
    <div class="thermostat-input__output">
      <p class="thermostat-input__value">
        {{ value }}°C
      </p>
      <p class="thermostat-input__text">
        Установленная температура
      </p>
    </div>

    <div ref="slider" class="thermostat-input__range">
      <div ref="dragArea" class="thermostat-input__drag-area" />
      <svg ref="svg" xmlns="http://www.w3.org/2000/svg">
        <circle
          ref="path"
          fill="none"
          stroke="#212433"
          stroke-linecap="round"
          stroke-width="12"
          :r="radius"
          :cx="cx"
          :cy="cx"
          :stroke-dasharray="dasharray"
          :stroke-dashoffset="dashoffset"
        />
        <circle
          ref="progress"
          class="thermostat-input__progress"
          fill="none"
          stroke="#E387FF"
          stroke-linecap="round"
          :stroke-width="strokeW"
          :r="radius"
          :cx="cx"
          :cy="cx"
          :stroke-dashoffset="dashoffset"
        />
        <circle
          id="current"
          ref="currentMark"
          fill="#32be55"
          class="thermostat-svg__current"
          r="4"
        />
        <circle
          id="thumb"
          ref="thumb"
          :r="thumbRad"
          cx="120.379"
          cy="120.379"
          fill="#B2D0F3"
        />
      </svg>
    </div>

    <div class="thermostat-input__controls">
      <button
        class="thermostat-input__controls-action blank"
        :disabled="!(p < max)"
        @click.prevent="setValueByNumber(p + 1)"
      >
        <span class="thermostat-input__controls-text">
          {{ max }}°C
        </span>
        +
      </button>
      <button
        class="thermostat-input__controls-action blank"
        :disabled="!(p > min)"
        @click.prevent="setValueByNumber(p - 1)"
      >
        <span class="thermostat-input__controls-text">
          {{ min }}°C
        </span>
        -
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

export interface IThermostatProps {
  value: number
  min:number
  max:number
  step:number
  current?:number
}
const { value, min, max, step, current } = defineProps<IThermostatProps>()

const emit = defineEmits(['t-input'])
const p = ref(value)

// elements
const svg = ref<InstanceType<typeof SVGElement>>()
const path = ref<InstanceType<typeof SVGElement>>()
const progress = ref<InstanceType<typeof SVGElement>>()
const currentMark = ref<InstanceType<typeof SVGElement>>()
const thumb = ref<InstanceType<typeof SVGElement>>()
const thermostat = ref<InstanceType<typeof HTMLDivElement>>()
const dragArea = ref<InstanceType<typeof HTMLDivElement>>()
const slider = ref<InstanceType<typeof HTMLDivElement>>()
const thumbRad = 14

const currentStep = computed(() => p.value - min)
const totalSteps = computed(() => max - min)
const isMoving = ref(false)

// sizes
const height = 230
const strokeW = 12
const cx = computed(() => height / 2)
const radius = computed(() => height / 2 - strokeW - thumbRad)
const dasharray = computed(() => Math.PI * radius.value)
const stepSize = computed(() => dashoffset.value / (totalSteps.value))
const dashoffset = ref(0)
const centerX = computed(() => slider.value!.getBoundingClientRect().left + slider.value!.clientWidth / 2)
const centerY = computed(() => slider.value!.getBoundingClientRect().top + slider.value!.clientHeight / 2)

function emitSliderValue (newP = p.value, delay:number) {
  emit('t-input', { value: newP, delay: 2000 })
}

watch(p, (newVal) => {
  renderTrack()
  renderThumb()
  emitSliderValue(newVal, 2000)
})

// calculate progress
const setValueByPercents = (percents: number) => {
  p.value = Math.round((min + ((totalSteps.value) * percents)) / step) * step
}

const setValueByNumber = (value: number) => {
  p.value = value
}

// render
const renderSvg = (h = 216) => {
  dashoffset.value = dasharray.value
  svg.value?.setAttribute('viewBox', `0 0 ${h} ${h}`)
  renderTrack()
  renderThumb()
  renderThumb(true)
}

const renderTrack = () => {
  progress.value?.setAttribute('stroke-dasharray', `${stepSize.value * currentStep.value}  ${dasharray.value * 2 - (stepSize.value * currentStep.value)}`)
}

const renderThumb = (isCurrent?: boolean) => {
  const normalizedValue = ((isCurrent ? current ?? 0 : p.value) - min) / (max - min)
  const clampedValue = Math.max(0, Math.min(1, normalizedValue))
  const angle = Math.PI * (1 - clampedValue)
  const x = radius.value * Math.cos(angle)
  const y = radius.value * Math.sin(angle)

  if (isCurrent) {
    currentMark.value?.setAttribute('cx', `${radius.value + x + thumbRad + 12}`)
    currentMark.value?.setAttribute('cy', `${radius.value - y + thumbRad + 12}`)
    return
  }

  thumb.value?.setAttribute('cx', `${radius.value + x + thumbRad * 2}`)
  thumb.value?.setAttribute('cy', `${radius.value - y + thumbRad * 2}`)
}

const slide = (event: MouseEvent & TouchEvent) => {
  if (!isMoving.value) { return }

  const e = event?.touches ? event.touches[0] : event
  const deltaX = e.clientX - centerX.value
  const deltaY = e.clientY - centerY.value

  const angleRad = Math.atan2(deltaY, deltaX)
  const angleDeg = angleRad * 180 / Math.PI

  const rotationAngle = (angleDeg + 180) % 360
  if (rotationAngle <= 180) {
    const progressPercent = rotationAngle / 180
    setValueByPercents(progressPercent)
  }
}

onMounted(() => {
  renderSvg(height)
  dragArea.value?.addEventListener('mousedown', (event: MouseEvent) => {
    isMoving.value = true
    slide(event as MouseEvent & TouchEvent)
  })
  dragArea.value?.addEventListener('touchstart', () => (event: TouchEvent) => {
    isMoving.value = true
    slide(event as MouseEvent & TouchEvent)
  })
  dragArea.value?.addEventListener('mousemove', (event: MouseEvent) => { slide(event as MouseEvent & TouchEvent) })
  dragArea.value?.addEventListener('touchmove', (event: TouchEvent) => {
    isMoving.value = true
    slide(event as MouseEvent & TouchEvent)
  })
  window.addEventListener('mouseup', () => { isMoving.value = false })
  window.addEventListener('touchend', () => { isMoving.value = false })
})

onUnmounted(() => {
  dragArea.value?.removeEventListener('mousedown', () => {})
  dragArea.value?.removeEventListener('touchstart', () => {})
  dragArea.value?.removeEventListener('mousemove', () => {})
  dragArea.value?.removeEventListener('touchmove', () => {})
  window.removeEventListener('mouseup', () => {})
  window.removeEventListener('touchend', () => {})
})
</script>

<style lang="scss">
@import "assets/styles/components/thermostat-input";
</style>
