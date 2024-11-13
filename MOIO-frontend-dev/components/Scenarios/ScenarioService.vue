<template>
  <div
    ref="service"
    class="service --scenario --click-able"
    :class="`
      ${(selected && isHideState) ||
      (((isDeviceOn === true || isDeviceOn === 'true') && !isDeviceCurtain) ||
      (isDeviceSensorMove && isDeviceSensorMoveValue)||
      (isDeviceSensorOpen && isDeviceSensorOpenValue)||
      String(isDeviceOpen)?.indexOf('open') > -1 ||
      Number.parseInt(deviceOpenValue?.value) === deviceOpenValue?.range?.max) 
      // Добавлена проверка, т.к. у штор специфические capability
      ? '--active':''}`" 
    role="button"
  >
    <div
      ref="info" class="service-info"
      @click.right="handleRightMouse()"
      @click.left="handleLeftMouse()"
    >
      <div class="service-ico-wrapper">
        <ui-icon :name="ico" size="24" />
      </div>
      <div v-if="stuff?.value && !isDeviceCurtain" class="service-stuff">
        {{ stuff?.value }}
        {{ stuff?.instance?.includes('temp')?'°C':'' }}
        {{ stuff.instance?.includes('brightness')?'%':'' }}
        <ui-icon v-show="isDeviceFan" :name="fanIcon!" size="20" />
      </div>

      <!-- Вывод информации о шторах, т.к. у них специфический capability -->
      <div v-if="isDeviceCurtain" class="service-stuff">
        {{ curtainStatus }}
      </div>
      <!-- Конце вывода информации о Шторах -->

      <ui-checkbox 
        v-if="isShowCheckbox" 
        style="z-index: 2;" 
        class="checked" 
        :checked="selected" 
        @click.stop="emit('selectDevice', { ...props})" 
      />

      <div class="service-name">
        <span>
          {{ name }}
        </span>
      </div>
    </div>
    <div 
      v-if="isMounted && capabilities?.length && capabilities.length >= 1 && !isHideCapabilityModal"
      class="service-capabilities-list-wrapper"
    >
      <ui-modal 
        v-if="isMounted" 
        :is-shown="isCapabilitiesShow" 
        transition-fade-name="fade"
        transition-content-name="translate" 
        backdrop-filter="blur(5px)" 
        border="1px solid var(--color-border)"
      >
        <template #inner>
          <div ref="target" class="service-capabilities-modal" role="dialog">
            <div class="service-capabilities-modal__header">
              <span>
                {{ name }}
              </span>
              <ui-toggle
                v-if="onOffCapability"
               :checked="isDeviceOn  || isDeviceOpen === 'open' "
                vertical-large openable 
                @check="(e: boolean) => emit('toggleDevice', { id: props.id, state: e })" />
                
            </div>
            <div class="service-capabilities-modal__body">
              <service-capabilities-structure>
                <template
                  v-for="capability in deviceCapabilities"
                  :key="getCapabilityTypeInstanceName(capability)"
                  #[getCapabilityTypeInstanceName(capability)]
                >
                  <scenarios-scenario-service-capability
                    :device-id="id.replace(/_ch[0-9]*/gm,'')"
                    :chanel="id.replace(/^[a-zA-Z0-9_.-]*_ch/gm,'')"
                    :instance="capability.instance"
                    :range="capability.range"
                    :reportable="capability.reportable"
                    :retrievable="capability.retrievable"
                    :type="capability.type"
                    :capability-custom-type="capability.capabilityCustomType"
                    :device-type="type"
                    :hsv="capability.hsv"
                    :value="capability.value"
                    :icon="ico"
                    @update-bool-val="(e: any) => { emit('updateCapability', e) }"
                  />
                </template>
              </service-capabilities-structure>
            </div>
          </div>
        </template>
      </ui-modal>
    </div>
    <ui-icon 
      v-if="isShowDeleteIcon" 
      name="delete" 
      color="#D15151" 
      size="20" 
      class="--delete"
      @click.prevent="emit('leftMouseClick', props)" 
    />
  </div>
</template>

<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import UiModal from "~/components/ui/UiModal.vue"
import useIcoByDeviceType from "~/composables/useIcoByDeviceType"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { ServiceProps } from "~/components/Service/TheService.vue"
import type { ICapability } from '~/api/automations/getById'
import { modeIcons } from "~/utils/variables"

export interface IScenarioService {
  selected?: boolean
  isHideState?: boolean
  isHideCapabilityModal?: boolean
  isShowDeleteIcon?: boolean
  isShowCheckbox?: boolean
}

const props = defineProps<IScenarioService & ServiceProps>()
const emit = defineEmits<{
  selectDevice: [any],
  leftMouseClick: [IScenarioService & ServiceProps],
  updateCapability: [any],
  toggleDevice: [any]
  onOff: [any]
}>()
const turnOn = ref()
const isMounted = ref(false)
const service = ref<HTMLDivElement | null>(null)
const isCapabilitiesShow = ref(false)
const target = ref(null)
const ico = props.deviceIcon?.name ?? useIcoByDeviceType(props.type).name
const info = ref()
const floatValue = ref(props.capabilities?.find(el => el.type.includes('float')))
const stuff = ref<ICapability>({} as ICapability)
const isDeviceOn = ref(props.capabilities?.find(el => el.type === 'devices.capabilities.on_off')?.value)
const isDeviceOpen = ref(props.capabilities?.find(el => el.instance === 'open' || el.type === 'devices.types.openable.garage')?.value)
const isDeviceFan = ref(props.type === 'devices.types.fan')
const isDeviceCurtain = ref(props.type === 'devices.types.openable.curtain') // Тип шторы
const isDeviceSensorMove = ref(props.type === 'devices.types.sensor.motion')
const isDeviceSensorOpen = ref(props.type === 'devices.types.sensor.open')
const isDeviceFanValue = ref(props.capabilities?.find(el => el.instance === 'fan_speed')?.value)
const isDeviceSensorMoveValue = computed(() => !(isDeviceSensorMove && props.capabilities?.find(el => el.value === 'not_detected')))
const isDeviceSensorOpenValue = computed(() => !!(isDeviceSensorOpen && props.capabilities?.find(el => el.value === 'init')))
const onOffCapability = computed(() => props.capabilities?.find(capability => (capability.instance === 'open' || capability.type === 'devices.capabilities.on_off') && !isDeviceCurtain.value))
const deviceCapabilities = computed(() => props.capabilities?.filter(capability => !(capability.instance === 'open' || capability.type === 'devices.capabilities.on_off') || isDeviceCurtain.value))
const fanIcon = computed(() => {
  return modeIcons.find(item => item.mode === Number(isDeviceFanValue.value))?.icon
})

// Вычисляемое значение "Открытости" у Штор
const deviceOpenValue = computed(() => props.capabilities?.find(el => el.instance === 'open'))

// Значение статуса "Открытости" у Штор
const curtainStatus = computed(() => {
  if (deviceOpenValue.value?.value === null) {
    return ''
  }

  if (Number.parseInt(deviceOpenValue.value?.value) === deviceOpenValue.value?.range?.min) {
    return 'Открыто'
  }

  if (Number.parseInt(deviceOpenValue.value?.value) === deviceOpenValue.value?.range?.max) {
    return 'Закрыто'
  }

  // Вычисляем значение на range у Штор
  const range = deviceOpenValue.value?.range?.max
    ? (deviceOpenValue.value.range.max - deviceOpenValue.value?.value)
    : (100 - deviceOpenValue.value?.value)

  return `Открыто на ${range}%`
})

onClickOutside(target, () => {
  isCapabilitiesShow.value = false
  setDisplayedStuff()
}, { ignore: [info] })

function handleLeftMouse() {
  if (props.isHideCapabilityModal) {
    emit('selectDevice', props)
  }
  if (onOffCapability.value?.instance === 'open') {
    emit('toggleDevice', { id: props.id, state:  !(onOffCapability.value?.value === 'open')})
  } else {
    emit('toggleDevice', { id: props.id, state:  !(onOffCapability.value?.value)})
  }
}
// Получение типа capability, которые состоят из type и instance
function getCapabilityTypeInstanceName(item: ICapability) {
  return `${item.type}${item.instance ? '-' + item.instance : ''}`
}

function handleRightMouse() {
  isCapabilitiesShow.value = true
}

function setDisplayedStuff() {
  if ((props?.capabilities?.length && props?.capabilities?.length <= 1) || props.type.includes('_sen')) { return }
  const capabilityWithFloatValueIdx = props.capabilities?.findIndex(el => Number.parseFloat(el.value) && el.type.includes('properties.float')) as number
  const capabilityWithRangeIdx = props.capabilities?.findIndex(el => el.type === 'devices.capabilities.range') as number
  const capabilityWithNumValueIdx = props.capabilities?.findIndex(el => Number.isInteger(el.value)) as number
  const hsvIdx = props.capabilities?.findIndex(el => el?.hsv?.h || el?.hsv?.s || el?.hsv?.v) as number

  const capabilityWithFanModeId = props.capabilities?.findIndex(el => el.type === 'devices.capabilities.mode') ?? -1

  if (props?.capabilities && props?.capabilities[capabilityWithFloatValueIdx]) {
    stuff.value = reactive(props?.capabilities[capabilityWithFloatValueIdx])
    floatValue.value = props?.capabilities[capabilityWithFloatValueIdx]
  }
  if (props?.capabilities && props?.capabilities[capabilityWithRangeIdx]) {
    stuff.value = reactive(props?.capabilities[capabilityWithRangeIdx])
  }
  if (props?.capabilities && !props?.capabilities[capabilityWithFloatValueIdx] && props?.capabilities[capabilityWithNumValueIdx]) {
    stuff.value = reactive(props?.capabilities[capabilityWithNumValueIdx])
  }
  if (props?.capabilities && props?.capabilities[hsvIdx] && isDeviceOn.value) {
    stuff.value.hsv = props?.capabilities[hsvIdx].hsv
  }
  if (props?.capabilities && props?.capabilities[capabilityWithFanModeId] && isDeviceFan.value) {
    stuff.value = reactive(props?.capabilities[capabilityWithFanModeId])
  }
}

setDisplayedStuff()

onLongPress(service, () => {
  isCapabilitiesShow.value = true
}, { delay: 400 })

watch(props, (value) => {
  const newIsDeviceOn = value.capabilities?.find(el => el.type === 'devices.capabilities.on_off')?.value
  const newIsDeviceOpen = value.capabilities?.find(el => el.instance === 'open' || el.type === 'devices.types.openable.garage')?.value
  isDeviceOn.value = newIsDeviceOn
  isDeviceOpen.value = newIsDeviceOpen
  setDisplayedStuff()
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('contextmenu', () => { })
})
</script>

<style lang="scss">
@import "assets/styles/components/service-capabilities-modal";
@import "assets/styles/components/scenario-service";
</style>
