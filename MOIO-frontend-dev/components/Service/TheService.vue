<template>
  <div
    ref="service"
    :class="`service
    ${isAddRoom? '--add__room':''}
    ${isPending?' --pending ':' '}
    ${isDead?' --dead ':' '}
    ${!isSensorOrMeter ? ' --click-able' : ''}
    ${((((isDeviceOn === true ||
      isDeviceOpen == 'true') && !isDeviceCurtain) ||
      (isDeviceSensorMove && isDeviceSensorMoveValue === 'detected')||
      (isDeviceSensorOpen && isDeviceSensorOpenValue === 'opened')||
      (isDeviceSensorSmoke && isDeviceSensorSmokeValue === 'detected')||
      (isDeviceSensorWater && isDeviceSensorWaterValue === 'leak')||
      (isDeviceSensorButtonValue === 'long_press' || isDeviceSensorButtonValue === 'click' || isDeviceSensorButtonValue === 'double_click')||
      (String(isDeviceOpen)?.indexOf('open') > -1 && !isDeviceCurtain) ||
      Number.parseInt(deviceOpenValue?.value) === deviceOpenValue?.range?.max)
      ) // Приходится добавлять проверку, т.к. у штор странные capability
    ? '--active':''}`"
    role="button"
    :disabled="isPending&&!isDead"
    :aria-disabled="isPending&&!isDead"
    @mousedown.right="isCapabilitiesShow = true"
  >
    <div
      class="service-info"
      @click="turnOnDevice()"
    >
      <div
        :style="isDeviceOn && stuff?.hsv?.s ?
          `color:rgb(${Math.round(color?.red*255)},${Math.round(color?.green*255)},${Math.round(color?.blue*255)})` : ''"
        class="service-ico-wrapper"
      >
        <ui-icon :name="currentIcon" size="24" />
        <div v-if="capabilities?.find(el => el.type.includes('devices.capabilities.color_setting'))" :style="`background: rgb(${Math.round(color.red*255)},${Math.round(color.green*255)},${Math.round(color.blue*255)});`" class="service-ico-wrapper__color" />
        <ui-icon v-if="!isAutomation" style="z-index: 2;" name="header/dots-horizontal" size="28" class="setting" @click.stop="isCapabilitiesShow = true" />
        <ui-checkbox v-if="isAutomation" @click="selectDevice(props.id)" />
      </div>
      <div v-if="stuff?.value && !isDeviceCurtain && !isDeviceSensorHumidity" class="service-stuff">
        {{ stuff.value }}{{ stuff.instance?.includes('temp')?'°C':'' }}{{ stuff.instance?.includes('brightness')?'%':'' }}
        <ui-icon v-show="isDeviceFan" :name="fanIcon!" size="20" />
      </div>

      <!-- Вывод информации о Шторах, т.к. у них специфический capability -->
      <div v-if="isDeviceCurtain" class="service-stuff">
        {{ curtainStatus }}
      </div>
      <!-- Конец вывода информации о Шторах -->

      <p v-if="isDeviceValve" class="service-info__state">
        {{ isDeviceValveValue === 'open' ? "Открыто" : "Закрыто" }}
      </p>
      <p v-if="isDeviceSensorMove" class="service-info__state">
        {{ isDeviceSensorMoveValue === 'detected' ? "Есть Движение" : "Нет движения" }}
      </p>
      <p v-if="isDeviceSensorOpen" class="service-info__state">
        {{ isDeviceSensorOpenValue === 'opened' ? "Открыто" : "Закрыто" }}
      </p>
      <p v-if="isDeviceGarage" class="service-info__state">
        {{ isDeviceGarageValue === 'open' ? 'Открыто' : 'Закрыто' }}
      </p>
      <p v-if="isDeviceLock" class="service-info__state">
        {{ isDeviceLockValue === 'open' ? 'Открыто' : 'Закрыто' }}
      </p>
      <p v-if="isDeviceSensorSmoke" class="service-info__state">
        {{ isDeviceSensorSmokeValue === "detected" ? 'Есть задымление' : 'Нет дыма' }}
      </p>
      <p v-if="isDeviceSensorWater" class="service-info__state">
        {{ isDeviceSensorWaterValue === "leak" ? 'Есть протечка' : 'Нет протечки' }}
      </p>
      <p v-if="isDeviceSensorButton" class="service-info__state">
        {{ isDeviceSensorButtonValue === 'long_press' ? 'Зажата' : isDeviceSensorButtonValue === 'click' ? "Нажата" : isDeviceSensorButtonValue === 'double_click' ? "Дважды нажата" : "" }}
      </p>
      <!-- Вывод информации по температуре и датчику влажности-->
      <p v-if="isDeviceSensorHumidity || isDeviceSensorTemperature" class="service-info__state">
        {{ combinedDisplay }}
      </p>
      <div class="service-name">
        <span>
          {{ name }}
        </span>
      </div>
    </div>
    <div v-if="isMounted && capabilities?.length && capabilities?.length>=1" class="service-capabilities-list-wrapper">
      <ui-modal
        :is-shown="isCapabilitiesShow"
        transition-fade-name="fade"
        transition-content-name="translate"
        backdrop-filter="blur(5px)"
        width="420px"
      >
        <template #inner>
          <div ref="target" class="service-capabilities-modal" role="dialog">
            <div class="service-capabilities-modal__header">
              <button class="blank" @click="openSelectIconModal">
                <ui-icon :name="selectedIcon" size="40" />
              </button>
              <span v-show="!isEdit" class="service-capabilities-modal__header-text" @click="setDeviceEdit">
                {{ name }}
              </span>
              <form v-if="canEdit" v-show="isEdit" class="service-capabilities-modal__header --edited" @submit.prevent="updateDeviceInfo()">
                <input v-model="newDeviceName" type="text">
              </form>
              <template v-for="item in onOffCapabilities" :key="item.type">
                <ui-toggle
                  v-if="canEdit"
                  :class="isPending ? '--pending' : ''"
                  :checked="String(item.value).includes('open') || String(item.value).includes('true')"
                  vertical-large
                  openable
                  @check="turnOnDevice"
                />
              </template>
            </div>
            <div class="service-capabilities-modal__change">
              <div class="service-capabilities-modal__home">
                <span class="service-capabilities-modal__home-room">
                  {{ catchRoom(props.groupId) }}
                </span>
              </div>
              <button class="service-capabilities-modal__btn" @click="isChangeParent = !isChangeParent">
                Переместить
              </button>
            </div>
            <transition name="changeParent">
              <div v-if="isChangeParent" class="service-capabilities-modal__parent">
                <ui-icon class="service-capabilities-modal__parent-ico" name="close" @click="isChangeParent = !isChangeParent" />
                <h2 class="service-capabilities-modal__parent-header">
                  Переместить устройство
                </h2>
                <div class="service-capabilities-modal__parent-flex">
                  <div class="scrollable-content scrollable-content--with-padding">
                    <ul class="service-capabilities-modal__parent-list">
                      <li
                        v-for="parent in upperGroups"
                        :key="parent.id"
                        class="service-capabilities-modal__parent-list-item"
                      >
                        <template v-if="currentHome?.groupCreatorId === userStore.id">
                          <button
                            class="service-capabilities-modal__parent-list-item__btn"
                            @click="changeGroup({groupId: parent.id, devicesIds: [props.id]})"
                          >
                            {{ parent.name }}
                          </button>
                        </template>
                        <template v-else-if="parent.id === groupStore.currentHome">
                          <button
                            class="service-capabilities-modal__parent-list-item__btn"
                            @click="changeGroup({groupId: parent.id, devicesIds: [props.id]})"
                          >
                            {{ parent.name }}
                          </button>
                        </template>
                      </li>
                    </ul>
                    <ul class="service-capabilities-modal__parent-list">
                      <li
                        v-for="parent in rooms"
                        :key="parent.id"
                        class="service-capabilities-modal__parent-list-item"
                      >
                        <button
                          class="service-capabilities-modal__parent-list-item__btn"
                          @click="changeGroup({groupId: parent.id, devicesIds: [props.id]})"
                        >
                          {{ parent.name }}
                        </button>
                      </li>
                    </ul>
                    <ul class="service-capabilities-modal__parent-list">
                      <li
                        v-for="parent in floors"
                        :key="parent.id"
                        class="service-capabilities-modal__parent-list-item"
                      >
                        <button
                          class="service-capabilities-modal__parent-list-item__btn"
                          @click="changeGroup({groupId: parent.id, devicesIds: [props.id]})"
                        >
                          {{ parent.name }}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </transition>
            <div
              :class="`service-capabilities-modal__body
              ${(isDeviceOn || String(isDeviceOpen)?.indexOf('true') > -1 || String(isDeviceOpen)?.indexOf('open') > -1) ||
              (isDeviceCurtain ? '--active' : '')}`"
            >
              <service-capabilities-structure
                :class="{
                  'service-capability-structure__flex': isDeviceSensorHumidity && capabilities.length > 1,
                  'service-capability-structure__divider': isDeviceSensorHumidity && capabilities.length > 1
                }"
              >
                <template
                  v-for="item in deviceCapabilities"
                  :key="getCapabilityTypeInstanceName(item)"
                  #[getCapabilityTypeInstanceName(item)]
                >
                  <service-capability
                    :device-id="id"
                    :chanel="id.replace(/^[a-zA-Z0-9_.-]*_(ch|sen)/gm, '')"
                    :instance="item?.instance"
                    :range="item?.range"
                    :reportable="item?.reportable"
                    :retrievable="item?.retrievable"
                    :type="item.type"
                    :device-type="type"
                    :hsv="item?.hsv"
                    :value="item.value"
                    :icon="deviceIcon?.name"
                    :float="floatValue?.value"
                    :is-pending="isPending"
                    :brightness="capabilities?.find(el => el.instance?.includes('bright'))?.value"
                    :capability-count="capabilities.length"
                    @update-bool-val="turnOnDevice()"
                  />
                </template>
              </service-capabilities-structure>
              <div v-if="canEdit" class="service-capabilities-modal__footer">
                <transition name="wizard">
                  <ui-button
                    v-show="isEdit"
                    rounded="12px"
                    padding="0px"
                    fill="var(--device-action)"
                    @click="updateDeviceInfo()"
                  >
                    Сохранить изменения
                  </ui-button>
                </transition>
                <transition name="wizard">
                  <ui-button
                    v-show="isEdit"
                    rounded="12px"
                    padding="0px"
                    fill="var(--device-action)"
                    @click="cancelUpdateDeviceInfo()"
                  >
                    Отменить изменения
                  </ui-button>
                </transition>
                <ui-button
                  rounded="12px"
                  padding="0px"
                  fill="var(--device-action)"
                  @click="isDeleteModalShow = true"
                >
                  Удалить устройство
                </ui-button>
              </div>
            </div>
          </div>
        </template>
      </ui-modal>
    </div>
    <ui-modal v-if="canEdit" ref="deleteModal" :is-shown="isDeleteModalShow" transition-content-name="translate" backdrop-filter="blur(5px)" width="395px" @click-outside="isDeleteModalShow = false">
      <template #inner>
        <div class="delete-device-modal" role="dialog">
          <div class="delete-device-modal__header">
            Вы уверены, что хотите удалить устройство {{ name }}?
          </div>
          <div class="delete-device-modal__prompt">
            <div class="delete-device-modal__prompt-item --danger" role="button" @click="deleteDevice()">
              Удалить
            </div>
            <div class="delete-device-modal__prompt-item" role="button" @click="isDeleteModalShow = false">
              Отмена
            </div>
          </div>
        </div>
      </template>
    </ui-modal>
    <ui-modal v-if="canEdit" ref="iconModal" :is-shown="isIconModalShow" transition-content-name="translate" backdrop-filter="blur(5px)" width="388px" @click-outside="isIconModalShow=false">
      <template #inner>
        <div class="change-icon-modal" role="dialog">
          <div class="scrollable-content scrollable-content--with-padding">
            <div class="change-icon-modal__header">
              <ui-button class-name="blank" padding="0" margin-inline="0" class="blank close-button" @click="closeSelectIconModal">
                <ui-icon name="close" size="20" />
              </ui-button>
              <div class="change-icon-modal__header-text">
                Изменить иконку
              </div>
            </div>
            <div class="change-icon-modal__icons">
              <h2 class="change-icon-modal__subheader">
                Устройства
              </h2>
              <div class="change-icon-modal__icon-list">
                <span
                  v-for="icon in existingIcons?.devices"
                  :key="icon"
                  class="change-icon-modal__icon"
                  @click="selectedIcon = icon"
                >
                  <ui-icon
                    :name="icon"
                    size="40"
                    :class="selectedIcon?.length < 1 && currentIcon === icon ? '--selected' : selectedIcon === icon && '--selected'"
                  />
                </span>
              </div>
            </div>
            <div class="change-icon-modal__icons">
              <h2 class="change-icon-modal__subheader">
                Датчики
              </h2>
              <div class="change-icon-modal__icon-list">
                <span
                  v-for="icon in existingIcons?.sensor"
                  :key="icon"
                  class="change-icon-modal__icon"
                  @click="selectedIcon = icon"
                >
                  <ui-icon
                    :name="icon"
                    size="40"
                    :class="selectedIcon?.length < 1 && currentIcon === icon ? '--selected' : selectedIcon === icon && '--selected'"
                  />
                </span>
              </div>
            </div>
            <ui-button class="change-icon-modal__submit" padding="0px" rounded="12px" @click="isIconModalShow = false">
              Сохранить
            </ui-button>
          </div>
        </div>
      </template>
    </ui-modal>
  </div>
</template>

<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import UiModal from "~/components/ui/UiModal.vue"
import useIcoByDeviceType from "~/composables/useIcoByDeviceType"
import { useDevicesStore } from "~/store/devices"
import { useGroupsStore } from "~/store/groups"
import { useCategoriesStore } from "~/store/categories"
import UiIcon from "~/components/ui/UiIcon.vue"
import useHSVToRGB from "~/composables/useHSVToRGB"
import type { TUiIconNames } from "#build/types/ui-icon"
import { useUserStore } from '~/store/user'
import type { IDeviceChangeGroup } from '~/api/device/changeGroupDevices'
import type { ICapability } from '~/api/automations/getById'
import { modeIcons } from "~/utils/variables"

export interface ServiceProps {
  id:string
  name: string
  type: string
  deviceCustomType: string
  isAddRoom?:boolean
  capabilities?:ICapability[]
  categoryId?:number
  deviceIcon: { name:TUiIconNames } | null
  parentName?:any
  isAutomation: boolean
  groupId?:string|number
  canEdit?:boolean
}

const emit = defineEmits<{
    updateDevice:any
}>()
const { $bus } = useNuxtApp()
const deviceStore = useDevicesStore()
const groupStore = useGroupsStore()
const categoriesStore = useCategoriesStore()
const userStore = useUserStore()

const props = defineProps<ServiceProps>()
const { deviceIcon } = props
const isMounted = ref(false)
const service = ref<HTMLDivElement | null>(null)
const isCapabilitiesShow = ref(false)
const isDeviceOn = ref(props.capabilities?.find(el => el.type === 'devices.capabilities.on_off')?.value)
const isDeviceOpen = ref(props.capabilities?.find(el => el.instance === 'open' || el.type === 'devices.types.openable.garage')?.value)
const isDeviceValve = ref(props.type === 'devices.types.openable.valve')
const isDeviceFan = ref(props.type === 'devices.types.fan')
const isDeviceCurtain = ref(props.type === 'devices.types.openable.curtain') // Тип: Шторы
const isDeviceSensorMove = ref(props.type === 'devices.types.sensor.motion')
const isDeviceSensorOpen = ref(props.type === 'devices.types.sensor.open')
const isDeviceGarage = ref(props.type === 'devices.types.openable.garage')
const isDeviceLock = ref(props.type === 'devices.types.openable.lock')
const isDeviceSensorSmoke = ref(props.type === 'devices.types.sensor.smoke')
const isDeviceSensorWater = ref(props.type === 'devices.types.sensor.water_leak')
const isDeviceSensorButton = ref(props.type === 'devices.types.sensor.button')
const isDeviceSensorTemperature = ref(props.capabilities?.find(el => el.instance === 'temperature') && props.type === 'devices.types.sensor') // Тип: Датчик температуры
const isDeviceSensorHumidity = ref(props.capabilities?.find(el => el.instance === 'humidity') && props.type === 'devices.types.sensor') // Тип: Датчик влажности
const isDeviceValveValue = ref(props.capabilities?.find(el => el.instance === 'open')?.value)
const isDeviceFanValue = ref(props.capabilities?.find(el => el.instance === 'fan_speed')?.value)
const isDeviceSensorMoveValue = ref(props.capabilities?.find(el => el.instance === 'motion')?.value)
const isDeviceSensorOpenValue = ref(props.capabilities?.find(el => el.instance === 'open')?.value)
const isDeviceGarageValue = ref(props.capabilities?.find(el => el.instance === 'open')?.value)
const isDeviceLockValue = ref(props.capabilities?.find(el => el.instance === 'open')?.value)
const isDeviceSensorSmokeValue = ref(props.capabilities?.find(el => el.instance === 'smoke')?.value)
const isDeviceSensorWaterValue = ref(props.capabilities?.find(el => el.instance === 'water_leak')?.value)
const isDeviceSensorButtonValue = ref(props.capabilities?.find(el => el.instance === 'button')?.value)
const isDeviceSensorTemperatureValue = ref(props.capabilities?.find(el => el.instance === 'temperature')?.value) // Значение датчика температуры
const isDeviceSensorHumidityValue = ref(props.capabilities?.find(el => el.instance === 'humidity')?.value) // Значение датчика влажности

const target = ref(null)
const deleteModal = ref(null)
const iconModal = ref(null)
const ico = props.deviceIcon?.name ?? useIcoByDeviceType(props.type).name
const isEdit = ref(false)
const isPending = ref(false)
const isDead = ref(false)
const isDeleteModalShow = ref(false)
const isIconModalShow = ref(false)
const currentIcon = ref<TUiIconNames>(props.deviceIcon?.name ?? ico)
const selectedIcon = ref<TUiIconNames>(currentIcon.value)
const existingIcons = uiIconNames
const newDeviceName = ref(props.name)
const floatValue = ref(props.capabilities?.find(el => el.type.includes('float')))
const stuff = ref<ICapability>({} as ICapability)
const isChangeParent = ref(false)
const { rooms, floors, upperGroups } = storeToRefs(groupStore)
const currentHome = ref(upperGroups.value.find(el => el.id === groupStore.currentHome))
const color = computed(() => stuff.value.hsv?.s && stuff.value.hsv?.v ? useHSVToRGB(Number(stuff.value.hsv?.h), stuff.value.hsv?.s, stuff.value.hsv?.v) : { red: 1, green: 1, blue: 1 })
const isDeviceSelected = ref(false)
const onOffCapabilities = computed(() => props.capabilities?.filter(el => (el.instance === 'open' || el.type.includes("on_off")) && !isDeviceCurtain.value))
const deviceCapabilities = computed(() => props.capabilities?.filter(el => !(el.instance === 'open' || el.type.includes("on_off")) || isDeviceCurtain.value))

const catchRoom = (id:any) => {
  const name = groupStore.groupById(id)
  return name?.name
}

const fanIcon = computed(() => {
  return modeIcons.find(item => item.mode === Number(isDeviceFanValue.value))?.icon
})

// Флаг, если устройство датчик или счетчик
const isSensorOrMeter = computed(() =>
  isDeviceSensorMove.value ||
  isDeviceSensorOpen.value ||
  isDeviceSensorSmoke.value ||
  isDeviceSensorWater.value ||
  isDeviceSensorButton.value ||
  isDeviceSensorTemperature.value ||
  isDeviceSensorHumidity.value ||
  props.type.includes('smart_meter'))

// Вычисляемое значение capability у Штор
const deviceOpenValue = computed(() => props.capabilities?.find(el => el.instance === 'open'))

// Значение статуса "Открытости" у штор
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

const refresh = () => {
  window.location.reload()
}
onClickOutside(target, (event) => {
  isCapabilitiesShow.value = false
  isDeleteModalShow.value = false
  isIconModalShow.value = false

  // После закрытия модалки обновляю данные
  setDisplayedStuff()
}, { ignore: [deleteModal, iconModal] })

function selectDevice (id:string) {
  isDeviceSelected.value = !isDeviceSelected.value
  const obj =
  {
    id: props.id,
    name: props.name,
    type: props.type,
    icon: props.deviceIcon,
    capabilities: props.capabilities,
  }
  $bus.emit('automationSelectDevice', { value: obj, isSelected: isDeviceSelected.value })
}
onLongPress(service, () => {
  if (navigator.maxTouchPoints > 0 && !isPending.value) {
    isCapabilitiesShow.value = true
  }
}, { delay: 400 })

function openSelectIconModal () {
  if (props.canEdit) {
    isIconModalShow.value = true
    isEdit.value = true
  }
}
function closeSelectIconModal () {
  isIconModalShow.value = false
  selectedIcon.value = currentIcon.value
}
function setDeviceEdit () {
  if (props.canEdit) {
    isEdit.value = true
  }
}
async function turnOnDevice () {
  if (!(props.type.includes('sensor') || props.type.includes('smart_meter'))) {
    isPending.value = true

    const oldValue = props.capabilities?.find(el => el.type.includes('on_off') || (el.type.includes('range') && el.instance?.includes('open')))?.value
    const newValue = !oldValue || String(oldValue).includes('close') || String(oldValue).includes('false')
    const isOpenable = props?.capabilities?.find(el => el.instance?.includes('open'))

    if (isDeviceCurtain.value) { // Проверка, что это шторы, потому что у них специфический capability range/open с числами
      const newOpennessValue = (Number.parseInt(oldValue) === 0) ? 100 : 0
      await deviceStore.changeOpenness({ deviceId: props.id, percentageOpen: newOpennessValue })
    } else if (isOpenable) {
      await deviceStore.changeOpenClose({ deviceId: props.id, open: newValue })
    } else {
      await deviceStore.changeOnOf({ deviceId: props.id, onOffStatus: newValue })
    }
    emit('updateDevice')
    const timeout = setTimeout(() => {
      if (isPending.value) {
        isDead.value = true
      } else {
        clearTimeout(timeout)
      }
    }, 1 * 60 * 1000)
  }
}
async function deleteDevice () {
  const res = await deviceStore.deleteDevice(props.id)
  isDeleteModalShow.value = false
  isCapabilitiesShow.value = false
  if (service.value && res?.includes('Девайс с Id')) {
    service.value.style.display = 'none'
    groupStore.removeDeviceFromCurrentGroup(props.id)
  }
}
async function refreshData () {
  if (Number.isInteger(Number(props.groupId))) {
    await categoriesStore.getDevicesByCategoryId(Number(props.groupId), groupStore.currentHome)
  } else {
    await groupStore.getGroupById(groupStore.group.id)
  }
}
function cancelUpdateDeviceInfo () {
  newDeviceName.value = props.name
  selectedIcon.value = currentIcon.value
  isEdit.value = false
}
async function updateDeviceInfo () {
  if (newDeviceName.value?.length && newDeviceName.value !== props.name) {
    await deviceStore.changeName(props.id, newDeviceName.value)
  }
  if (selectedIcon.value !== currentIcon.value) {
    await deviceStore.changeIcon(props.id, selectedIcon.value)
  }
  isEdit.value = false
  await refreshData()
}

async function changeGroup (props: IDeviceChangeGroup) {
  await deviceStore.changeGroup(props)
  refresh()
}

// Получение типа capability, которые состоят из type и instance
function getCapabilityTypeInstanceName (item:ICapability) {
  return `${item.type}${item.instance ? '-' + item.instance : ''}`
}

const temperatureDisplay = computed(() => {
  // Если есть числовое значение температуры, то выводим его с символом градусов
  return typeof isDeviceSensorTemperatureValue.value === 'number'
    ? isDeviceSensorTemperatureValue.value + '°C'
    : null // Возвращаем null, если данных нет
})

const humidityDisplay = computed(() => {
  // Если есть числовое значение влажности, то выводим его с символом процента
  return typeof isDeviceSensorHumidityValue.value === 'number'
    ? isDeviceSensorHumidityValue.value + '%'
    : null // Возвращаем null, если данных нет
})

const combinedDisplay = computed(() => {
  // Если оба датчика имеют данные
  if (temperatureDisplay.value && humidityDisplay.value) {
    return temperatureDisplay.value + ' | ' + humidityDisplay.value
  }

  // Если есть данные только по температуре
  if (temperatureDisplay.value) {
    return temperatureDisplay.value
  }

  // Если есть данные только по влажности
  if (humidityDisplay.value) {
    return humidityDisplay.value
  }

  // Если данных нет ни по одному датчику
  return 'Нет данных'
})

function setDisplayedStuff () {
  if (props?.capabilities?.length && props?.capabilities?.length <= 1) { return }
  const capabilityWithFloatValueIdx = props.capabilities?.findIndex(el => Number.parseFloat(el.value) && el.type.includes('properties.float')) as number
  const capabilityWithRangeIdx = props.capabilities?.findIndex(el => el.type.includes('capabilities.range')) as number
  const capabilityWithNumValueIdx = props.capabilities?.findIndex(el => Number.isInteger(el.value)) as number
  const hsvIdx = props.capabilities?.findIndex(el => el?.hsv?.h || el?.hsv?.s || el?.hsv?.v) as number
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
}
watch(props, (value) => {
  const newIsDeviceOn = value.capabilities?.find(el => el.type === 'devices.capabilities.on_off')?.value
  const newIsDeviceOpen = value.capabilities?.find(el => el.instance === 'open' || el.type === 'devices.types.openable.garage')?.value
  const newIsDeviceValveValue = value.capabilities?.find(el => el.instance === 'open')?.value
  const newIsDeviceFanValue = value.capabilities?.find(el => el.instance === 'fan_speed')?.value
  const newIsDeviceSensorMoveValue = value.capabilities?.find(el => el.instance === 'motion')?.value
  const newIsDeviceSensorOpenValue = value.capabilities?.find(el => el.instance === 'open')?.value
  const newIsDeviceGarageValue = value.capabilities?.find(el => el.instance === 'open')?.value
  const newIsDeviceLockValue = value.capabilities?.find(el => el.instance === 'open')?.value
  const newIsDeviceSensorSmokeValue = value.capabilities?.find(el => el.instance === 'smoke')?.value
  const newIsDeviceSensorWaterValue = value.capabilities?.find(el => el.instance === 'water_leak')?.value
  const newIsDeviceSensorButtonValue = value.capabilities?.find(el => el.instance === 'button')?.value

  isDeviceValveValue.value = newIsDeviceValveValue
  isDeviceFanValue.value = newIsDeviceFanValue
  isDeviceSensorMoveValue.value = newIsDeviceSensorMoveValue
  isDeviceSensorOpenValue.value = newIsDeviceSensorOpenValue
  isDeviceGarageValue.value = newIsDeviceGarageValue
  isDeviceLockValue.value = newIsDeviceLockValue
  isDeviceSensorSmokeValue.value = newIsDeviceSensorSmokeValue
  isDeviceSensorWaterValue.value = newIsDeviceSensorWaterValue
  isDeviceOn.value = newIsDeviceOn
  isDeviceOpen.value = newIsDeviceOpen
  isDeviceSensorButtonValue.value = newIsDeviceSensorButtonValue
  currentIcon.value = props.deviceIcon?.name ?? ico

  setDisplayedStuff()
}, { deep: true })

watch([isDeviceOpen, isDeviceOn], () => {
  isPending.value = false
}, { deep: true })
watch(isCapabilitiesShow, (val) => { if (!val) { cancelUpdateDeviceInfo() } })
const onStateUpdate = (data:ServiceProps) => {
  if (data.id === props.id) {
    isPending.value = false
  }
}
onMounted(() => {
  $bus.on('device-update-emit', onStateUpdate)
  setTimeout(() => {
    isMounted.value = true
    setDisplayedStuff()

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }, 100)
})
onUnmounted(() => {
  $bus.off('device-update-emit', setDisplayedStuff)
  window.removeEventListener('contextmenu', () => {})
})
</script>

<style lang="scss">
@import "assets/styles/components/service";
@import "assets/styles/components/service-capabilities-modal";
@import "assets/styles/components/service-delete-modal";
@import "assets/styles/components/service-edit-ico-modal";
@import "assets/styles/components/service-capability-structure";

.setting{
  color: $bg-service-primary;
}
.--add__room{
  width: 100% !important;
}
.changeParent-enter-active,
.changeParent-leave-active {
  transition: all 0.5s ease;
}

.changeParent-enter-from,
.changeParent-leave-to {
  opacity: 0;
  transform: translateX(-100%);
  transition: 0.5s ease;
}
.changeParent-enter-to,
.changeParent-leave-from {
  opacity: 1;
  transform: translateX(0);
  transition: 0.5s ease;
}

.wizard-enter-active,
.wizard-leave-active {
  transition: all 0.5s ease;
}

.wizard-enter-from,
.wizard-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.wizard-enter-to,
.wizard-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
