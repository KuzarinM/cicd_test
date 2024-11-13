<template>
  <div v-if="show" class="automation__device">
    <div class="scrollable-content">
      <div class="automation__device-header">
        <ui-icon class="automation__device-header-close" name="close" @click="emit('prevStep', { step: 1 })" />
        <h1 class="automation__device-header-head">
          Действие
        </h1>
        <span class="automation__device-header-save-btn" @click="saveHandle()">Готово</span>
      </div>
      <div class="automation__device-list">
        <div class="group-list">
          <h2 class="group-list__header">
            Нераспределённые устройства
          </h2>
          <div class="subgroup-item__service-list">
            <scenario-service 
              v-for="device in useFilteredByRoleDevices(existingDevices.devices, 'device')"
              :key="device.id" 
              :id="device.id" 
              :group-id="existingDevices.id" 
              :name="device.name" 
              :type="device.type"
              :capabilities="device?.capabilities"
              :selected="selectedDevices?.includes(device.id) ?? false"
              :is-show-checkbox="true"
              :device-icon="device.deviceIcon"
              @toggle-device="e => { turnOnOffDevice(e, existingDevices) }"
              @select-device="setDevice" 
              @update-capability="e => updateDevice(e, existingDevices)"
              @on-off="e => { turnOnOffDevice(e) }" />
          </div>
        </div>
        <div class="group-list" v-for="group in existingDevices.inverseParent" :key="group.id">
          <h2 class="group-list__header">
            {{ group.name }}
          </h2>
          <div class="subgroup-item__service-list">
            <scenario-service
              v-for="device in useFilteredByRoleDevices(group.devices, 'device')" 
              :key="device.id"
              :id="device.id"
              :group-id="existingDevices.id" 
              :name="device.name" 
              :type="device.type"
              :capabilities="device?.capabilities"
              :selected="selectedDevices?.includes(device.id) ?? false"
              :is-show-checkbox="true"
              :device-icon="device.deviceIcon"
              @toggle-device="e => { turnOnOffDevice(e, group) }" 
              @select-device="setDevice"
              @update-capability="e => updateDevice(e, group)" @on-off="e => { turnOnOffDevice(e, group) }" 
            />
          </div>
        </div>
      </div>
      <div class="automation__device-scenarios">
        <h2 class="automation__subheader">
          {{ existingScenarios.length !== 0 ? 'Сценарий' : 'Нет доступных сценариев' }}
        </h2>
        <div class="automation__device-scenarios-list">
          <div v-for="scenario in existingScenarios" :key="scenario.id"
            :class="`automation__device-scenarios-list-item ${selectedScenarios?.includes(scenario.id) ? '--active' : ''}`"
            @click="selectScenarios(scenario.id, scenario.name)">
            {{ scenario.name }}
          </div>
        </div>
      </div>
      <div class="automation__device-repeat">
        <h2>Повторять</h2>
        <div class="automation__device-repeat-list">
          <div v-for="item in enableRepeat" :key="item.id"
            :class="`automation__device-repeat-list-item ${repeats.findIndex(el => el === item.id) > -1 ? '--active' : ''}`"
            @click="selectRepeat(item.id)">
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import { useScenarioStore } from "~/store/scenario"
import "vue-scroll-picker/lib/style.css"
import ScenarioService from "../Scenarios/ScenarioService.vue"
import useFilteredByRoleDevices from '~/composables/useFilteredByRoleDevices'

export interface IAutomationAddDeviceToScenarios {
  show: boolean,
  selectedDevices?: string[],
  selectedScenarios?: string[]
}

const emit = defineEmits<{
  prevStep: [{ step: number }],
  selectScenario: [{ id: string, name: string }]
  getDevicesCapability: [any]
  updateDeviceCapabilities: [any]
  days: [{ days: number[] }]
}>()
const props = defineProps<IAutomationAddDeviceToScenarios>()
const groupStore = useGroupsStore()
const repeats = ref<number[]>([])
const existingScenarios = await useScenarioStore().getAll(groupStore.currentHome)
const enableTime = ref(1)
const existingDevices = ref(await groupStore.getGroupById(groupStore.currentHome))


const enableRepeat = [
  {
    id: 1,
    name: 'Пн',
  },
  {
    id: 2,
    name: 'Вт',
  },
  {
    id: 3,
    name: 'Ср',
  },
  {
    id: 4,
    name: 'Чт',
  },
  {
    id: 5,
    name: 'Пт',
  },
  {
    id: 6,
    name: 'Сб',
  },
  {
    id: 7,
    name: 'Вс',
  },
]

// Метод обновления состояний устройства при создании анонимных сценариев
function updateDevice(event: any, group?: any) {
  const currentDevice = group.devices.findIndex(device => device.id === event.deviceId);

  // Находим capability для обновления
  const capabilityId = group.devices[currentDevice].capabilities.findIndex(capability => capability.type === event.type)
  group.devices[currentDevice].capabilities[capabilityId] = event

  // если меняется яркость - меняем яркость в hsb
  if (event.instance == 'brightness') {
    const colorId = group.devices[currentDevice].capabilities?.findIndex(capability => capability.type === 'devices.capabilities.color_setting')
    const colorCapabilities = {
      deviceId: event.deviceId,
      chanel: event.chanel,
      ...group.devices[currentDevice].capabilities[colorId],
      hsv: {
        ...group.devices[currentDevice].capabilities[colorId].hsv,
        v: Number(event.value),
      },
    }
    
    updateDevice(colorCapabilities, group)
  }

  emit("updateDeviceCapabilities", event)
}
function turnOnOffDevice(targetDevice: any, group?: any) {
  let isChanged = false
  const deviceIdx = group.devices.findIndex(devices => devices.id === targetDevice.id)
  if (deviceIdx > -1) {
    const capabilitiesIdx = group.devices[deviceIdx].capabilities.findIndex(capability => capability.type === 'devices.capabilities.on_off')
    if (capabilitiesIdx > -1) {
      group.devices[deviceIdx].capabilities[capabilitiesIdx].value = targetDevice.state
      isChanged = true
    }
    if (capabilitiesIdx === -1) {
      const capabilitiesIdx1 = group.devices[deviceIdx].capabilities.findIndex(capability => capability.type === 'devices.capabilities.range')
      if (group.devices[deviceIdx].capabilities[capabilitiesIdx1].value === 'open') {
        group.devices[deviceIdx].capabilities[capabilitiesIdx1].value = 'close'
      } else {
        group.devices[deviceIdx].capabilities[capabilitiesIdx1].value = 'open'
      }
      isChanged = true
    }
    return
  }
  if (group.inverseParent?.length && !isChanged) {
    for (let i = 0; i < group.inverseParent.length; i++) {
      turnOnOffDevice(e, group.inverseParent[i])
    }
  }
}

function setDevice(e: any) {
  const payload = { id: e.id, type: e.type, name: e.name, capabilities: e.capabilities }
  emit('getDevicesCapability', payload)
  let isChanged = false

  const changeSelected1 = (group) => {
    if (group.id === e.groupId) {
      const idx = group.devices?.findIndex(el => el.id === e.id)
      if (idx > -1) {
        group.devices[idx].selected = !group.devices[idx].selected
        isChanged = true
      }
    }
  }
  changeSelected1(existingDevices.value)
  const changeSelected = (group) => {
    if (group.id === e.groupId) {
      const idx = group.devices?.findIndex(el => el.id === e.id)
      if (idx > -1) {
        group.devices[idx].selected = !group.devices[idx].selected
        isChanged = true
        return
      }
    }
    if (group.inverseParent?.length && !isChanged) {
      for (let i = 0; i < group.inverseParent.length; i++) {
        changeSelected(group.inverseParent[i])
      }
    }
  }

  if (existingDevices.value.inverseParent?.length && !isChanged) {
    for (let i = 0; i < existingDevices.value.inverseParent.length; i++) {
      changeSelected(existingDevices.value.inverseParent[i])
    }
  }
}
function selectScenarios(id: string, name: string) {
  emit('selectScenario', {id: id, name: name})
}

const scrollPickerModal = ref([5])
const options = computed(() => {
  const arra: [{ value: number, label: string }[]] = [[]]
  for (let i = 0; i <= 12; i++) {
    if (i < 12) {
      arra[0].push({ value: (i + 1) * 5, label: `через ${(i + 1) * 5} мин` })
    } else if (i = 12) {
      arra[0].push({ value: 120, label: `через ${2} часа` })
    } else {
      arra[0].push({ value: 360, label: `через ${3} часа` })
    }
  }
  return arra
})
const saveHandle = () => {
  emit('prevStep', { step: 0 })
}
function selectRepeat(id: number) {
  const isRepeatExist = repeats.value.findIndex(el => el === id)
  if (isRepeatExist > -1) {
    repeats.value.splice(isRepeatExist, 1)
    return
  }
  repeats.value.push(id)
  emit('days', { days: repeats.value })
}
</script>

<style lang="scss">
.column-content {
  overflow: hidden !important;
}

.automation__device {
  position: absolute;
  padding: 20px;
  top: 0;
  left: 0;
  width: 100%;
  inset: 0;
  overflow-y: hidden;
  z-index: 12;
  background-color: $bg-primary;

  @media (max-width: 1200px) {
    padding-right: 0;
  }

  &-header {
    &-close {
      padding-bottom: 20px;
      cursor: pointer;
    }

    &-head {
      margin-bottom: 40px;
    }

    &-save {
      &-btn {
        background: none;
        border: none;
        color: $color-active;
        font-size: 16px;
        position: absolute;
        right: 20px;
        top: 20px;
        cursor: pointer;
      }
    }
  }

  &-time {
    padding-top: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid $color-border;

    &__header {
      margin-bottom: 12px;
    }

    &__text {
      color: $color-test;
      font-size: 16px;
    }

    &__scroll {
      margin-top: 20px;

      .pad-top-overlay-custom {
        background: none !important;
      }

      .pad-bottom-overlay-custom {
        background: none !important;
      }
    }
  }

  &-list {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin-bottom: 40px;
  }

  .service-name {
    margin-right: 30px;
    white-space: normal;
  }

  .group-list__parent-row-item-automation {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 24px;
    display: inline-block;
    line-height: 32px;
    padding-right: 40px;
    color: $color-test;
    font-weight: 700;

    &.--active {
      color: $color-primary;
    }
  }

  &-scenarios {
    padding-bottom: 40px;
    border-top: 1px solid $color-border;
    border-bottom: 1px solid $color-border;

    &-list {
      display: grid;
      gap: 12px;
      margin-top: 40px;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

      @media screen and (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
      }

      @media screen and (max-width: 425px) {
        grid-template-columns: 1fr;
      }

      &-item {
        border: 1px solid $color-bg-switch;
        border-radius: 12px;
        cursor: pointer;
        font-size: 24px;
        padding: 20px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow-x: hidden;

        @media screen and (max-width: 768px) {
          font-size: 18px;
        }

        &.--active {
          border: 1px solid $color-active;
          background-color: $bg-service-active;
        }
      }
    }
  }

  &-repeat {
    padding-top: 40px;

    &-list {
      margin-top: 20px;
      padding-bottom: 40px;
      border-bottom: 1px solid $color-border;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      &-item {
        border-radius: 12px;
        padding: 14px;
        font-size: 24px;

        @media screen and (max-width: 520px) {
          font-size: 16px;
          padding: 4px;
        }

        cursor: pointer;

        &.--active {
          border: 1px solid $color-active;
          background-color: $bg-service-active;
        }
      }
    }
  }
}
</style>
