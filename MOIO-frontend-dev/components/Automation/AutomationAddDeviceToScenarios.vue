<template>
  <div v-if="props.show" class="automation__device">
    <div class="scrollable-content">
      <div class="automation__device-header">
        <ui-icon class="automation__device-header-close" name="close" @click="emit('prevStep',{step:1})" />
        <h1 class="automation__device-header-head">
          Действие
        </h1>
        <span class="automation__device-header-save-btn" @click="saveHandle()">Готово</span>
      </div>
      <div class="group-list__parent">
        <div class="group-list__parent-row">
          <div class="automation__device-group">
            <h2 class="automation__device-header">
              Нераспределённые устройства
            </h2>
            <group-list
              v-show="true"
              :id="existingDevices.id"
              :key="existingDevices.id"
              :devices="existingDevices.devices"
              :name="existingDevices.name"
              :parent-name="existingDevices.name"
              :is-scenarios="false"
              :is-main-page="true"
              :hide-devices="false"
              :hide-empty="false"
              :hide-sensors="true"
              :can-edit="false"
              :is-automation="true"
              @get-data="setDevice"
              @update="e => updateDevice(e)"
              @on-off-device="e => {turnOnOffDevice(e)}"
            />
            <span
              v-for="item in existingDevices.inverseParent" v-show="true"
              :key="item.id"
              :class="`group-list__parent-row-item-automation ${isShowRoom == item.id ? '--active':''}`"
              @click="isShowRoom = item.id ?? ''"
            >
              {{ item.name }}
            </span>
          </div>
        </div>
        <group-list
          v-for="group in existingDevices.inverseParent"
          v-show="true? isShowRoom == group.id:true"
          :id="group.id"
          :key="group.id"
          :devices="group.devices"
          :name="group.name"
          :parent-name="group.name"
          :inverse-parent="group?.inverseParent"
          :is-scenarios="false"
          :is-mainpage="true"
          :hide-devices="false"
          :hide-empty="false"
          :hide-sensors="true"
          :can-edit="false"
          :is-automation="true"
          @get-data="setDevice"
          @update="e => updateDevice(e,group)"
          @on-off-device="e => {turnOnOffDevice(e,group)}"
        />
      </div>
      <div class="automation__device-scenarios">
        <h2 class="automation__subheader">
          {{ existingScenarios.length !== 0 ? 'Сценарий' : 'Нет доступных сценариев' }}
        </h2>
        <div class="automation__device-scenarios-list">
          <div
            v-for="scenario in existingScenarios"
            :key="scenario.id"
            :class="`automation__device-scenarios-list-item ${scenarios.findIndex(el=>el.id===scenario.id)>-1?'--active':''}`"
            @click="selectScenarios(scenario.id, scenario.name)"
          >
            {{ scenario.name }}
          </div>
        </div>
      </div>
      <!-- <div class="automation__device-time">
          <h2 class="automation__device-time__header">Выключить</h2>
          <p class="automation__device-time__text">Аксессуары, включающиеся этой автоматизацией будут выключены через 55 мин</p>
          <div
          :class="`automation-select-range__tab-value-condition-item`"
          @click="enableTime = 1"
          >
          <ui-checkbox
          :initial-bg="'var(--settings-color)'"
          :checked="enableTime === 1"
          @check="enableTime = 1"
          />
          Нет
          </div>

          <div
          :class="`automation-select-range__tab-value-condition-item`"
          @click="enableTime = 0"
          >
          <ui-checkbox
          :initial-bg="'var(--settings-color)'"
          :checked="enableTime === 0"
          @check="enableTime = 0"
          />
          Через время
          </div>
          <ScrollPicker
          class="automation__device-time__scroll"
          :options="options"
          v-model="scrollPickerModal"
          />
        </div> -->
      <div class="automation__device-repeat">
        <h2>Повторять</h2>
        <div class="automation__device-repeat-list">
          <div v-for="item in enableRepeat" :key="item.id" :class="`automation__device-repeat-list-item ${repeats.findIndex(el=>el===item.id)>-1?'--active':''}`" @click="selectRepeat(item.id)">
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

export interface IAutomationAddDeviceToScenarios {
  show: boolean
}

const emit = defineEmits<{
  prevStep:[{step:number}],
  saveScenarios: [{id:string, name:string}[]]
  getDevicesCapability:[any]
  updateDeviceCapabilities:[any]
  days:[{days:number[]}]
}>()
const props = defineProps<IAutomationAddDeviceToScenarios>()
const groupStore = useGroupsStore()
const scenarios = ref<{id:string, name:string}[]>([])
const repeats = ref<number[]>([])
const existingScenarios = await useScenarioStore().getAll(groupStore.currentHome)
const enableTime = ref(1)
const existingDevices = ref(await groupStore.getGroupById(groupStore.currentHome))

const isShowRoom = ref<string>(existingDevices.value.inverseParent?.[0]?.id ?? '')
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
function updateDevice (event:any, group?:any) {
  let isChanged = false
  // TODO: Проверка нужна для разделения монолита и микро-сервисов
  // В дальнейшем от этого необходимо избавиться
  if (event.chanel === event.deviceId) {
    const currentDeviceId = existingDevices.value.devices.findIndex(el => el.id === event.deviceId)
    if (currentDeviceId > -1) {
      // Находим capability для обновления
      const capabilityId = existingDevices.value.devices[currentDeviceId].capabilities.findIndex(el => el.type === event.type)

      existingDevices.value.devices[currentDeviceId].capabilities[capabilityId].value = event.value

      existingDevices.value.devices[currentDeviceId].selected = true

      isChanged = true

      emit("updateDeviceCapabilities", event)
    } else {
      const deviceId = group.devices.findIndex(el => el.id === event.deviceId)

      if (deviceId > -1) {
        const capabilitiesIdx = group.devices[deviceId].capabilities.findIndex(el => el.type === event.type)

        group.devices[deviceId].capabilities[capabilitiesIdx].value = event.value

        group.devices[deviceId].selected = true

        isChanged = true

        emit("updateDeviceCapabilities", event)
        return
      }
      if (group.inverseParent?.length && !isChanged) {
        for (let i = 0; i < group.inverseParent.length; i++) {
          updateDevice(event, group.inverseParent[i])
        }
      }
    }
  } else {
    const curDevice = existingDevices.value.devices.findIndex(el => el.id === event.deviceId + '_ch' + event.chanel)

    if (curDevice > -1) {
      const capabilitiesIdx = existingDevices.value.devices[curDevice].capabilities.findIndex(el => el.type === event.type)
      existingDevices.value.devices[curDevice].capabilities[capabilitiesIdx].value = event.value
      existingDevices.value.devices[curDevice].selected = true
      isChanged = true
      emit("updateDeviceCapabilities", event)
    } else {
      const deviceIdx = group.devices.findIndex(el => el.id === event.deviceId + '_ch' + event.chanel)
      if (deviceIdx > -1) {
        const capabilitiesIdx = group.devices[deviceIdx].capabilities.findIndex(el => el.type === event.type)
        group.devices[deviceIdx].capabilities[capabilitiesIdx].value = event.value
        group.devices[deviceIdx].selected = true
        isChanged = true
        emit("updateDeviceCapabilities", event)
        return
      }
      if (group.inverseParent?.length && !isChanged) {
        for (let i = 0; i < group.inverseParent.length; i++) {
          updateDevice(event, group.inverseParent[i])
        }
      }
    }
  }
}
function turnOnOffDevice (e:any, group?:any) {
  let isChanged = false
  const curDevice = existingDevices.value.devices.findIndex(el => el.id === e.id)
  if (curDevice > -1) {
    const capabilitiesIdx = existingDevices.value.devices[curDevice].capabilities.findIndex(el => el.type === 'devices.capabilities.on_off')
    if (capabilitiesIdx > -1) {
      existingDevices.value.devices[curDevice].capabilities[capabilitiesIdx].value = e.state
      isChanged = true
    }
    if (capabilitiesIdx === -1) {
      const capabilitiesIdx = existingDevices.value.devices[curDevice].capabilities.findIndex(el => el.type === 'devices.capabilities.range')
      if (existingDevices.value.devices[curDevice].capabilities[capabilitiesIdx].value === 'open') {
        existingDevices.value.devices[curDevice].capabilities[capabilitiesIdx].value = 'close'
      } else {
        existingDevices.value.devices[curDevice].capabilities[capabilitiesIdx].value = 'open'
      }
      isChanged = true
    }
  } else {
    const deviceIdx = group.devices.findIndex(el => el.id === e.id)
    if (deviceIdx > -1) {
      const capabilitiesIdx = group.devices[deviceIdx].capabilities.findIndex(el => el.type === 'devices.capabilities.on_off')
      if (capabilitiesIdx > -1) {
        group.devices[deviceIdx].capabilities[capabilitiesIdx].value = e.state
        isChanged = true
      }
      if (capabilitiesIdx === -1) {
        const capabilitiesIdx1 = group.devices[deviceIdx].capabilities.findIndex(el => el.type === 'devices.capabilities.range')
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
}
function setDevice (e:any) {
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
function selectScenarios (id:string, name:string) {
  const isScenarioExist = scenarios.value.findIndex(el => el.id === id)
  if (isScenarioExist > -1) {
    scenarios.value.splice(isScenarioExist, 1)
    return
  }
  scenarios.value.push({ id, name })
}

const scrollPickerModal = ref([5])
const options = computed(() => {
  const arra:[{value:number, label:string}[]] = [[]]
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
  emit('saveScenarios', scenarios.value)
  emit('prevStep', { step: 0 })
}
function selectRepeat (id:number) {
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
  .column-content{
    overflow: hidden !important;
  }
.automation__device{
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
    &-header{
        &-close{
            padding-bottom: 20px;
            cursor: pointer;
        }
        &-head{
            margin-bottom: 40px;
        }
        &-save{
            &-btn{
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
    &-time{
        padding-top: 40px;
        padding-bottom: 40px;
        border-bottom: 1px solid $color-border;
        &__header{
            margin-bottom: 12px;
        }
        &__text{
            color: $color-test;
            font-size: 16px;
        }
        &__scroll{
            margin-top: 20px;
            .pad-top-overlay-custom{
                background: none !important;
            }
            .pad-bottom-overlay-custom{
                background: none !important;
            }
        }
    }
    .service-name {
      margin-right: 30px;
      white-space: normal;
    }
    .group-list__parent-row-item-automation{
      display: flex;
			align-items: center;
			cursor: pointer;
			font-size: 24px;
			display: inline-block;
			line-height: 32px;
			padding-right: 40px;
			color: $color-test;
      font-weight: 700;
			&.--active{
				color: $color-primary;
			}
    }
    &-scenarios{
        padding-bottom: 40px;
        border-top: 1px solid $color-border;
        border-bottom: 1px solid $color-border;
        &-list{
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
        &-item{
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
            &.--active{
                border: 1px solid $color-active;
                background-color: $bg-service-active;
            }
        }
        }
    }
    &-repeat{
        padding-top: 40px;
        &-list{
            margin-top: 20px;
            padding-bottom: 40px;
            border-bottom: 1px solid $color-border;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            &-item{
                border-radius: 12px;
                padding: 14px;
                font-size: 24px;
                @media screen and (max-width: 520px) {
                  font-size: 16px;
                  padding: 4px;
                }
                cursor: pointer;
                &.--active{
                    border: 1px solid $color-active;
                    background-color: $bg-service-active;
                }
            }
        }
    }
}
</style>
