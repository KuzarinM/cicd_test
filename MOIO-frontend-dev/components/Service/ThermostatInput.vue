<template>
  <div ref="thermostat" class="thermostat-input">
    <input
      id="range"
      ref="range"
      v-model="p"
      type="range"
      :min="0"
      :max="100"
      :step="props.step||1"
      hidden
    >
    <div class="thermostat-input__range-border --min">
      {{ min }}C
    </div>
    <label id="output" for="range" class="thermostat-input__value">
      {{ value }}C
    </label>
    <div class="thermostat-input__range-border --max">
      {{ max }}C
    </div>
    <svg
      ref="svg"
      class="thermostat-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 260"
      fill="none"
    >
      <path
        id="track"
        ref="track"
        d="M 240 240 A 1 1 0 0 0 0 240"
        fill="none"
        stroke="#212433" stroke-width="12"
        stroke-linecap="round"
      />
      <path
        id="progress"
        ref="progress"
        class="thermostat-svg__progress"
        d="M 240 240 A 1 1 0 0 0 0 240"
        fill="none"
        stroke-width="12" stroke-linecap="round"
      />
      <circle
        id="current"
        ref="currentMark"
        class="thermostat-svg__current"
        r="4"
        cx="108"
        cy="108"
        fill="#32be55"
        style="pointer-events: bounding-box"
      />
      <circle
        id="thumb"
        ref="thumb"
        r="14"
        cx="120.379"
        cy="120.379"
        fill="#B2D0F3"
      />
    </svg>
    <div class="thermostat-input__controls">
      <button
        class="thermostat-input__controls-action blank"
        :disabled="p>=100"
        @click.prevent="p=getSliderValue(value + step);updateSliderValue(p,5);thermostatAction()"
      >
        +
      </button>
      <button
        class="thermostat-input__controls-action blank"
        :disabled="p<=0"
        @click.prevent="p=getSliderValue(value - step);updateSliderValue(p,5);thermostatAction()"
      >
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
const props = defineProps<IThermostatProps>()

const emit = defineEmits(['t-input'])
const p = ref(getSliderValue(props.value))
const range = ref<InstanceType<typeof SVGElement>>()
const svg = ref<InstanceType<typeof SVGElement>>()
const progress = ref<InstanceType<typeof SVGElement>>()
const track = ref<InstanceType<typeof SVGGeometryElement>>()
const currentMark = ref<InstanceType<typeof SVGElement>>()
const thumb = ref<InstanceType<typeof SVGElement>>()
const thermostat = ref<InstanceType<typeof HTMLDivElement>>()

watch(p, (newP) => {
  updateSliderValue(newP, 2000)
})
const stepped = (val:number, divider:number) => {
  return (Math.floor((val + divider - 1) / divider)) * divider
}
function getSliderValue (value:number) {
  const max = props.max - props.min
  const flex = value - props.min
  return (flex / max) * 100
}
function updateSliderValue (newP = p.value, delay:number) {
  const unStepped = (props.max - props.min) * (newP / 100) + props.min
  emit('t-input', { value: Number((stepped(unStepped, (props.step || 1)) + 1 - props.step).toFixed(2)), delay })
}
const cache:{[key:string]:{[key:string]:any}} = {}
function memoize (fn:Function, key:string, args:any) {
  if (cache[key] && cache[key][args.toString()]) {
    return cache[key][args.toString()]
  }
  const data = fn(...args)
  cache[key] = {}
  cache[key][args.toString()] = data
  return data
}
function thermostatAction () {
  if (thermostat?.value) {
    let isMoving = false
    const stepAttr = props.step || 1
    const maxOfRange = parseFloat(range.value?.getAttribute('max') as string) || 100
    const minOfRange = parseFloat(range.value?.getAttribute('min') as string) || 1
    const steps = ((maxOfRange - minOfRange) / stepAttr)

    const getPoints = (trackLength:number) => {
      const points = []
      const step = trackLength / steps
      let progressLength = 0
      while (progressLength <= trackLength + 1) {
        const DOMPoint = track.value?.getPointAtLength(progressLength)
        points.push({ x: Number(DOMPoint?.x.toFixed(3)), y: Number(DOMPoint?.y.toFixed(3)), d: Number(progressLength) })
        progressLength += step
      }
      return points
    }

    const setPath = (value:number) => {
      const percentage = (value / maxOfRange)
      if (progress.value && track.value) {
        progress.value.style.strokeDasharray = `${track.value.getTotalLength() * percentage} 1000`
      }
    }
    const setThumb = () => {
      const points = memoize(getPoints, 'points', [track.value?.getTotalLength()])
      const newVal = Number(p.value)
      const index = Math.max(1, newVal) / stepAttr
      const point = points[Number(index.toFixed())] ? points[Number(index.toFixed())] : points[points?.length - 1]
      setCurrentSvg()
      thumb.value?.setAttribute('cx', point.x)
      thumb.value?.setAttribute('cy', point.y)
    }
    const setCurrentSvg = () => {
      if (props.current) {
        const points = memoize(getPoints, 'points', [track.value?.getTotalLength()])
        const newVal = Number(getSliderValue(props.current))
        const index = Math.max(1, newVal) / stepAttr
        const point = points[Number(index.toFixed())] ? points[Number(index.toFixed())] : points[points?.length - 1]
        currentMark.value?.setAttribute('cx', point.x)
        currentMark.value?.setAttribute('cy', (point.y * 1.01).toFixed(2))
      }
    }
    const getClosestPoint = (x:number, y:number) => {
      const distances:number[][] = []
      const points = memoize(getPoints, 'points', [track.value?.getTotalLength()])
      points.forEach((point:{x:number, y:number, d:number}, index:number) => {
        const diffX = x - point.x
        const diffY = y - point.y
        const distance = Math.sqrt((diffX * diffX) + (diffY * diffY)).toFixed(3)
        distances.push([index, parseFloat(distance)])
      })
      distances.sort((a, b) => a[1] - b[1])
      return points[distances[0][0]]
    }
    const render = (e:MouseEvent&TouchEvent) => {
      if (isMoving) {
        const rect = svg.value?.getBoundingClientRect()
        const trackLength = track.value?.getTotalLength()
        if (e?.touches) { e = e.touches[0] }
        const pos = {
          x: Number((e.clientX - (rect?.left ?? 0)).toFixed(3)),
          y: Number((e.clientY - (rect?.top ?? 0)).toFixed(3)),
        }
        const target = getClosestPoint(pos.x, pos.y)
        const covered = Math.round(target.d * maxOfRange / (trackLength ?? 1))

        thumb.value?.setAttribute('cx', target.x)
        thumb.value?.setAttribute('cy', target.y)
        setPath(covered)
        p.value = covered
      }
    }
    const setSVG = (w = 216, h = 216) => {
      svg.value?.setAttribute('width', `${w * 1.12}`)
      svg.value?.setAttribute('height', `${h * 1.12}`)
      svg.value?.setAttribute('viewBox', `0 ${w * 0.4} ${w} ${h * 1.12}`)
      track.value?.setAttribute('d', `M 0 ${w} A ${w / 2} ${w / 2} 0 0 1 ${w} ${w}`)
      track.value?.setAttribute('stroke-width', '12')
      progress.value?.setAttribute('d', `M 0 ${w} A ${w / 2} ${w / 2} 0 0 1 ${w} ${w}`)
      progress.value?.setAttribute('stroke-width', '12')
      thumb.value?.setAttribute('stroke-width', '8')
      thumb.value?.setAttribute('r', '14')
      setPath(p.value)
    }
    // sorry for that

    const capabilityModal = range.value?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
    const dragEnd = () => {
      isMoving = false
      if (capabilityModal?.style) {
        capabilityModal.style.overflowY = 'auto'
      }
      if (svg.value?.classList) {
        svg.value.classList.remove('moving')
      }
    }

    const dragStart = () => {
      isMoving = true
      if (capabilityModal?.style) {
        capabilityModal.style.overflowY = 'hidden'
      }

      if (svg.value?.classList) {
        svg.value.classList.add('moving')
      }
    }


    range.value?.addEventListener('input', () => {
      range.value?.classList.remove('has-focus')
      setPath(p.value)
      setThumb()
    })

    svg.value?.addEventListener('mousedown', (e) => {
      dragStart()
      render(e as MouseEvent & TouchEvent)
    })
    thumb.value?.addEventListener('mousedown', () => {
      dragStart()
      svg.value?.addEventListener('mousemove', e => render(e as MouseEvent & TouchEvent))
    })

    thumb.value?.addEventListener('touchstart', () => {
      dragStart()
      thumb.value?.addEventListener('touchmove', e => render(e as MouseEvent & TouchEvent))
    }, { passive: true })
    window.addEventListener('mouseup', dragEnd)
    window.addEventListener('touchend', dragEnd)
    setSVG()
    memoize(getPoints, 'points', [track.value?.getTotalLength()])
    setThumb()
    setPath(p.value)
  }
}
onMounted(() => {
  thermostatAction()
})

onUnmounted(() => {
  window.removeEventListener('mouseup', () => {})
  window.removeEventListener('touchend', () => {})
})
</script>

<style lang="scss">
@import "assets/styles/components/thermostat-input";
</style>
