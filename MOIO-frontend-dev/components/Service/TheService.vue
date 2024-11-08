<template>
  <div
    ref="service"
    :class="`service
    ${isPending?' --pending ':' '}
    ${isDead?' --dead ':' '}
    ${isDeviceOn === true ||
      isDeviceOpen == 'true' ||
      String(isDeviceOpen)?.indexOf('open') > -1
    ? '--active':''}`"
    role="button"
    :disabled="isPending&&!isDead"
    :aria-disabled="isPending&&!isDead"
    @mousedown.right="isCapabilitiesShow = true"
  >
    <div class="service-info" @mousedown.left="turnOnDevice()">
      <div
        :style="isDeviceOn && stuff?.hsv?.s && `color:rgb(${Math.round(color?.red*255)},${Math.round(color?.green*255)},${Math.round(color?.blue*255)})`"
        class="service-ico-wrapper"
      >
        <ui-icon :name="currentIcon" size="36" />
        <div v-if="stuff?.value" class="service-stuff">
          {{ stuff.value }}{{ stuff.instance?.includes('temp')?'°C':'' }}{{ stuff.instance?.includes('brightness')?'%':'' }}
        </div>
      </div>
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
        width="320px"
      >
        <template #inner>
          <div ref="target" class="service-capabilities-modal" role="dialog">
            <div class="service-capabilities-modal__header">
              <div v-if="canEdit" class="edit-ico" @click="isEdit=!isEdit">
                <ui-icon name="pencil" size="inherit" />
              </div>
              <span v-show="!isEdit" class="service-capabilities-modal__header-text">
                {{ name }}
              </span>
              <form v-if="canEdit" v-show="isEdit" class="service-capabilities-modal__header --edited" @submit.prevent="setNewDeviceName()">
                <input v-model="newDeviceName" type="text">
                <ui-button
                  type="submit"
                  rounded="100%"
                  fill="var(--color-active)"
                  class-name="blank"
                  padding="2px"
                >
                  <ui-icon name="check" size="16" />
                </ui-button>
              </form>
            </div>
            <div :class="`service-capabilities-modal__body ${isDeviceOn|| String(isDeviceOpen)?.indexOf('true')>-1 || String(isDeviceOpen)?.indexOf('open') > -1 ? '--active':''}`">
              <service-capabilities-structure>
                <template
                  v-for="item in capabilities"
                  :key="item.type"
                  #[item.type]
                >
                  <service-capability
                    :device-id="id"
                    :chanel="id.replace(/^[a-zA-Z0-9_.-]*_ch/gm,'')"
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
                    :brightness="capabilities?.find(el=>el.instance?.includes('bright'))?.value"
                    @update-bool-val="turnOnDevice()"
                  />
                </template>
              </service-capabilities-structure>
              <div v-if="canEdit" class="service-capabilities-modal__footer">
                <ui-button
                  padding="8px 16px"
                  rounded="20px"
                  fill="var(--device-action)"
                  @click="isDeleteModalShow = true"
                >
                  Удалить устройство
                </ui-button>
                <ui-button
                  padding="8px 16px"
                  rounded="20px"
                  fill="var(--device-action)"
                  @click="isIconModalShow = true"
                >
                  Изменить иконку
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
            Вы уверерны, что хотите удалить устройство {{ name }}?
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
    <ui-modal v-if="canEdit" ref="iconModal" :is-shown="isIconModalShow" transition-content-name="translate" backdrop-filter="blur(5px)" width="528px" @click-outside="isIconModalShow=false">
      <template #inner>
        <div class="change-icon-modal" role="dialog">
          <div class="change-icon-modal__header">
            <div class="change-icon-modal__header-text">
              Выберите иконку устройства
            </div>
            <ui-button class-name="blank" padding="0" margin-inline="0" class="blank close-button" @click="isIconModalShow = false">
              <ui-icon name="close" />
            </ui-button>
          </div>
          <div class="change-icon-modal__icons">
            <h2 class="change-icon-modal__subheader">
              Устройства
            </h2>
            <span
              v-for="icon in existingIcons?.devices"
              :key="icon"
              class="change-icon-modal__icon"
              @click="selectedIcon = icon"
            >
              <ui-icon
                :name="icon"
                size="52"
                :class="selectedIcon?.length < 1 && currentIcon === icon ? '--selected' : selectedIcon === icon && '--selected'"
              />
            </span>
          </div>
          <div class="change-icon-modal__icons">
            <h2 class="change-icon-modal__subheader">
              Датчики
            </h2>
            <span
              v-for="icon in existingIcons?.sensor"
              :key="icon"
              class="change-icon-modal__icon"
              @click="selectedIcon = icon"
            >
              <ui-icon
                :name="icon"
                size="52"
                :class="selectedIcon?.length < 1 && currentIcon === icon ? '--selected' : selectedIcon === icon && '--selected'"
              />
            </span>
          </div>
          <ui-button class="change-icon-modal__submit" rounded="16px" @click="setNewIcon()">
            Сохранить
          </ui-button>
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

export interface ICapability {
  type: string
  retrievable?: boolean
  reportable?: boolean
  value?: any
  instance?: string
  range?: {
    min: number
    max: number
    precision: number
  }
  hsv?: {
    h: number
    s: number
    v: number
  }
}
export interface ServiceProps {
  id:string
  name: string
  type:string
  capabilities?:ICapability[]
  categoryId?:number
  deviceIcon: { name:TUiIconNames } | null
  groupId?:string|number
    canEdit?:boolean
}

const deviceStore = useDevicesStore()
const groupStore = useGroupsStore()
const categoriesStore = useCategoriesStore()

const props = defineProps<ServiceProps>()
const isMounted = ref(false)
const service = ref<HTMLDivElement | null>(null)
const isCapabilitiesShow = ref(false)
const isDeviceOn = ref(props.capabilities?.find(el => el.type === 'devices.capabilities.on_off')?.value)
const isDeviceOpen = ref(props.capabilities?.find(el => el.instance === 'open' || el.type === 'devices.types.openable.garage')?.value)
const target = ref(null)
const deleteModal = ref(null)
const iconModal = ref(null)
const ico = props.deviceIcon?.name ?? useIcoByDeviceType(props.type).name
const isEdit = ref(false)
const isPending = ref(false)
const isDead = ref(false)
const isDeleteModalShow = ref(false)
const isIconModalShow = ref(false)
const currentIcon:TUiIconNames = props.deviceIcon?.name ?? ico
const selectedIcon = ref<TUiIconNames>(currentIcon)
const existingIcons = uiIconNames
const newDeviceName = ref(props.name)
const floatValue = ref(props.capabilities?.find(el => el.type.includes('float')))
const { $bus } = useNuxtApp()
const stuff = ref<ICapability>({} as ICapability)
const color = computed(() => stuff.value.hsv?.s && stuff.value.hsv?.v ? useHSVToRGB(Number(stuff.value.hsv?.h), stuff.value.hsv?.s / 100, stuff.value.hsv?.v / 100) : { red: 1, green: 1, blue: 1 })

onClickOutside(target, (event) => {
  isCapabilitiesShow.value = false
  isDeleteModalShow.value = false
  isIconModalShow.value = false
  // после закрытия модалки обновляю данные
  setDisplayedStuff()
}, { ignore: [deleteModal, iconModal] })

onLongPress(service, () => {
  if (navigator.maxTouchPoints > 0 && !isPending.value) {
    isCapabilitiesShow.value = true
  }
}, { delay: 400 })

async function turnOnDevice () {
  if (!props.id.includes('_sen')) {
    isPending.value = true

    const oldValue = props.capabilities?.find(el => el.type.includes('on_off') || (el.type.includes('range') && el.instance?.includes('open')))?.value
    const newValue = !oldValue || String(oldValue).includes('close') || String(oldValue).includes('false')
    const isOpenable = props?.capabilities?.find(el => el.instance?.includes('open'))

    if (isOpenable) {
      await deviceStore.changeOpenClose({ clientId: groupStore.clientId, deviceId: props.id, open: newValue })
    } else {
      await deviceStore.changeOnOf({ clientId: groupStore.clientId, deviceId: props.id, onOffStatus: newValue })
    }
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
  }
}
async function refreshData () {
  if (Number.isInteger(Number(props.groupId))) {
    await categoriesStore.getDevicesByCategoryId(Number(props.groupId), groupStore.currentHome)
  } else {
    await groupStore.getGroupById(groupStore.group.id)
  }
}
async function setNewDeviceName () {
  if (newDeviceName.value?.length && newDeviceName.value !== props.name) {
    await deviceStore.changeName(props.id, newDeviceName.value)
  }
  isEdit.value = false
  await refreshData()
}

async function setNewIcon () {
  await deviceStore.changeIcon(props.id, selectedIcon.value)
  isIconModalShow.value = false
  await refreshData()
}

function setDisplayedStuff () {
  if ((props?.capabilities?.length && props?.capabilities?.length <= 1) || props.type.includes('_sen')) { return }
  const capabilityWithFloatValueIdx = props.capabilities?.findIndex(el => Number.parseFloat(el.value) && el.type.includes('properties.float')) as number
  const capabilityWithNumValueIdx = props.capabilities?.findIndex(el => Number.isInteger(el.value)) as number
  const hsvIdx = props.capabilities?.findIndex(el => el?.hsv?.h || el?.hsv?.s || el?.hsv?.v) as number
  if (props?.capabilities && props?.capabilities[capabilityWithFloatValueIdx]) {
    stuff.value = reactive(props?.capabilities[capabilityWithFloatValueIdx])
    floatValue.value = props?.capabilities[capabilityWithFloatValueIdx]
  }
  if (props?.capabilities && !props?.capabilities[capabilityWithFloatValueIdx] && props?.capabilities[capabilityWithNumValueIdx]) {
    stuff.value = reactive(props?.capabilities[capabilityWithNumValueIdx])
  }
  if (props?.capabilities && props?.capabilities[hsvIdx] && isDeviceOn.value) {
    stuff.value.hsv = props?.capabilities[hsvIdx].hsv
  }
  if (!isDeviceOn.value) {
    stuff.value.hsv = { h: 1, s: 1, v: 64 }
  }
}
watch(props, (value) => {
  const newIsDeviceOn = value.capabilities?.find(el => el.type === 'devices.capabilities.on_off')?.value
  const newIsDeviceOpen = value.capabilities?.find(el => el.instance === 'open' || el.type === 'devices.types.openable.garage')?.value
  isDeviceOn.value = newIsDeviceOn
  isDeviceOpen.value = newIsDeviceOpen
}, { deep: true })

watch([isDeviceOpen, isDeviceOn], () => {
  isPending.value = false
}, { deep: true })
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

</style>
