<template>
  <div v-if="name" :class="`group-list  ${isCollapsed?'--collapsed':''} ${!isScenarios&&`--child-${childDepth || 0}`} `">
    <h1 v-if="!hideEmpty && !isMainPage" class="group-list__header">
      {{ name }}
    </h1>
    <h1 v-if="hideEmpty && (isNotEmpty || isGroupPage) && !isMainPage" :class="isScenarios ? `group-list__header  --text-scenarios` : 'group-list__header'" @click="isCollapsed = !isCollapsed">
      {{ name }}
    </h1>
    <h2 v-if="isGroupPage && !isFromHome" class="group-list__accessories-header">
      Аксессуары
    </h2>
    <div 
      v-if="filteredDevices()?.length && isScenarios" 
      class="subgroup-item__service-list"
    >
      <scenario-service
        v-for="device in filteredDevices()"
        :id="device.id"
        :key="device.id"
        :group-id="id"
        :name="device.name"
        :device-custom-type="device.deviceCustomType"
        :type="device.type"
        :capabilities="device?.capabilities"
        :device-icon="device?.deviceIcon"
        :selected="device?.selected"
        :is-show-checkbox="true"
        :is-hide-capability-modal="isScenarios"
        @select-device="e=>emit('getData',{...e,id:device.id})"
      />
    </div>
    <transition name="fade">
      <div v-if="!isFromHome && devices?.length && !isScenarios" class="subgroup-item__service-list">
        <the-service
          v-for="device in devices"
          :id="device.id"
          :key="device.id"
          :group-id="id"
          :name="device.name"
          :type="device.type"
          :capabilities="device?.capabilities"
          :device-icon="device.deviceIcon"
          :can-edit="canEdit"
        />
      </div>
    </transition>
    <div class="group-list__parent">
      <div ref="scrollContainer" class="group-list__parent-row">
          <span
            v-for="group in inverseParent" v-show="isMainPage"
            :key="group.id"
            ref="room"
            :class="`group-list__parent-row-item ${isShowRoom == group.id ? '--active':''} ${isAutomation ? `--automation`:''}`"
            @click="leftMouseHandler(group)"
            @touchstart="onTouchStart(group)"
            @touchend="cancelLongTouch"
            @touchcancel="cancelLongTouch"
            @contextmenu.prevent
          >
            {{ group.name }}
          </span>
      </div>
    </div>
    <transition name="fade">
      <div class="group-list__floor">
        <group-list
          v-for="group in inverseParent"
          v-show="isMainPage? isShowRoom == group.id:true"
          :id="group.id"
          :key="group.id"
          :devices="group.devices"
          :name="group.name"
          :parent-name="name"
          :inverse-parent="group?.inverseParent"
          :is-scenarios="isScenarios"
          :is-main-page="isMainPage"
          :hide-devices="hideDevices"
          :hide-empty="hideEmpty"
          :hide-sensors="hideSensors"
          :child-depth="(childDepth??0)+1"
          :can-edit="canEdit"
          @get-data="e=>emit('getData',{...e,groupId:group.id})"
          @update="e => {emit('update',e)}"
          @on-off-device="e => {emit('onOffDevice',e)}"
        />
      </div>
    </transition>

    <transition name="fade">
      <div>
        <h2 v-show="isFromHome && !childDepth && devices?.length && !isScenarios && !isAutomation" class="group-list__title">
          Нераспределённые аксессуары
        </h2>
        <div v-if="isFromHome && devices?.length && !isScenarios && !isAutomation" class="subgroup-item__service-list">
          <the-service
            v-for="device in devices"
            :id="device.id"
            :key="device.id"
            :group-id="id"
            :name="device.name"
            :type="device.type"
            :capabilities="device?.capabilities"
            :device-custom-type="device.deviceCustomType"
            :device-icon="device.deviceIcon"
            :can-edit="canEdit"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { IAllDevicesResponse } from "~/api/device/getAll"
import TheService, { type ServiceProps } from "~/components/Service/TheService.vue"
import ScenarioService, { type IScenarioService } from "~/components/Scenarios/ScenarioService.vue"
import { useGroupsStore } from "~/store/groups"

export interface GroupList {
  name?:string|null,
  parentName?:any
  id:string
  devices?: Array<IAllDevicesResponse & { selected?: boolean }>,
  inverseParent?: GroupList[],
  hideEmpty?:boolean
  hideSensors?:boolean
  hideDevices?:boolean
  isMainPage?:boolean
  isScenarios?:boolean
  childDepth?:number
  isGroupPage?:boolean
  typeId?:number|null
  canEdit?:boolean
  isFromHome?:boolean
}

const props = defineProps<GroupList>()
const emit = defineEmits<{
  getData:[IScenarioService & ServiceProps]
  update:[any]
  onOffDevice:[any]
}>()
const room = ref<HTMLDivElement | null>(null)
const isShowRoom = ref<string>(props.inverseParent?.[0]?.id ?? '')
const isCollapsed = ref(true)
const groupStore = useGroupsStore()
const longPressTimeout = ref<any>(null)

const isNotEmpty = computed(() => {
  if (props.typeId === groupStore.getGroupTypeId('House')) {
    return true
  }
  const devicesInChildren = props.inverseParent?.reduce((acc, curr) => acc + Number(curr.devices?.length ?? 0), 0)
  return Boolean(props.devices?.length || (props.inverseParent?.length && devicesInChildren))
})

// Вытаскиваем элемент с таким ref
const scrollContainer = shallowRef<HTMLElement | null>(null)

// Обработчик горизонтального скролла
const handleScroll = (event: WheelEvent) => {
  if (scrollContainer.value) {
    event.preventDefault()

    // Если есть горизонтальная составляющая, используем её (тачпад)
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      scrollContainer.value.scrollLeft += event.deltaX
    } else {
      // Если движение вертикальное (колесо мыши), направляем прокрутку в горизонтальное направление
      scrollContainer.value.scrollLeft += event.deltaY
    }
  }
}

// обработка нажатия пкм по названию группы
const leftMouseHandler = (group: GroupList) => {
  isShowRoom.value = group.id ?? ''
  group.typeId === groupStore.getGroupTypeId('Room') ? groupStore.setShowRoom(group.id) : groupStore.setShowFloor(group.id)
}

// пероход на страницу редактирования
const handleLongPress = (group: GroupList) => {
  if (isShowRoom.value !== group.id) { return }
  const groupType = group.typeId === groupStore.getGroupTypeId('Floor') ? 'floor' : 'room'
  navigateTo(`user/group/edit/${groupType}/${group.id}`)
}

// обработка долгого тапа
const onTouchStart = (group: GroupList) => longPressTimeout.value = setTimeout(() => handleLongPress(group), 500)

// отмена события при долгом тапе
const cancelLongTouch = () => clearTimeout(longPressTimeout.value)

const filteredDevices = () => {
  let temp: GroupList["devices"] = []

  if (!props.hideDevices && !props.hideSensors) { return props.devices }

  const role = props.hideDevices ? props.hideDevices === props.hideSensors ? 'meter' : 'sensor' : 'device'

  temp = useFilteredByRoleDevices(props.devices, role)

  return temp
}

// Привязываем событие к элементу при монтировании
onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('wheel', handleScroll)
  }
})

// Отвязываем событие от элемента при размонтировании
onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('wheel', handleScroll)
  }
})
</script>

<style lang="scss">
@import 'assets/styles/utils/transitions';
@import "assets/styles/components/group-list";
.--text-scenarios{
  color: $color-primary;
}
</style>
