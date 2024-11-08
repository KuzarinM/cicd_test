<template>
  <div v-if="name" :class="`group-list  ${isCollapsed?'--collapsed':''} ${!isScenarios&&`--child-${childDepth || 0}`} `">
    <h1 v-if="!hideEmpty" class="group-list__header">
      {{ name }}
    </h1>
    <h1 v-if="hideEmpty && (isNotEmpty || isGroupPage)" class="group-list__header" @click="isCollapsed = !isCollapsed">
      <ui-icon
        v-if="!isScenarios && isNotEmpty"
        :name="isCollapsed?'minus-thick':'plus-thick'"
        :size="28"
      />
      {{ name }}
    </h1>
    <div v-if="filteredDevices()?.length&&isScenarios" class="subgroup-item__service-list">
      <scenario-service
        v-for="device in filteredDevices()"
        :id="device.id"
        :key="device.id"
        :group-id="id"
        :name="device.name"
        :type="device.type"
        :capabilities="device?.capabilities"
        :is-preview="true"
        :selected="device?.selected"
        :device-icon="device.deviceIcon"
        @left-mouse-click="e=>emit('getData',{...e,groupId:id})"
      />
    </div>
    <transition v-show="isCollapsed" name="fade">
      <div v-if="devices?.length && !isScenarios" class="subgroup-item__service-list">
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
    <transition v-show="isCollapsed" name="fade">
      <div v-if="inverseParent?.length">
        <group-list
          v-for="group in inverseParent"
          :id="group.id"
          :key="group.id"
          :devices="group.devices"
          :name="group.name"
          :inverse-parent="group?.inverseParent"
          :is-scenarios="isScenarios"
          :hide-devices="hideDevices"
          :hide-empty="hideEmpty"
          :hide-sensors="hideSensors"
          :child-depth="(childDepth??0)+1"
          :can-edit="canEdit"
          @get-data="e=>emit('getData',{...e,groupId:group.id})"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { IAllDevicesResponse } from "~/api/device/getAll"
import TheService, { type ServiceProps } from "~/components/Service/TheService.vue"
import ScenarioService, { type IScenarioService } from "~/components/Scenarios/ScenarioService.vue"
import UiIcon from "~/components/ui/UiIcon.vue"

export interface GroupList {
  name?:string|null,
  id:string|number
  devices?: Array<IAllDevicesResponse & { selected?: boolean }>,
  inverseParent?: GroupList[],
  hideEmpty?:boolean
  hideSensors?:boolean
  hideDevices?:boolean
  isScenarios?:boolean
  childDepth?:number
  isGroupPage?:boolean
  typeId?:number|null
    canEdit?:boolean
}

const props = defineProps<GroupList>()
const emit = defineEmits<{
    getData:[IScenarioService & ServiceProps]
}>()
const isCollapsed = ref(true)

const isNotEmpty = computed(() => {
  if (props.typeId === 1) {
    return true
  }
  const devicesInChilds = props.inverseParent?.reduce((acc, curr) => acc + Number(curr.devices?.length ?? 0), 0)
  return Boolean(props.devices?.length || (props.inverseParent?.length && devicesInChilds))
})
const filteredDevices = () => {
  let temp: GroupList["devices"] = []
  if (!props.hideDevices && !props.hideSensors) { return props.devices }
  if (props.hideDevices && typeof props.hideDevices !== 'undefined') {
    temp = props.devices?.filter(el => !el.id.includes('_ch')) || []
  }
  if (props.hideSensors && typeof props.hideSensors !== 'undefined') {
    if (temp?.length) {
      temp = temp?.filter(el => !el.id?.includes('_sen'))
      return temp
    }
    temp = props.devices?.filter(el => !el.id.includes('_sen')) || []
  }
  return temp
}
</script>

<style lang="scss">
@import 'assets/styles/utils/transitions';
@import "assets/styles/components/group-list";

</style>
