<template>
  <div class="scenarios-create">
    <loader-screen :is-loading="isLoading" />
    <h1 class="scenarios-create__header">
      Создание сценария
    </h1>
    <div class="scenarios-create__search">
      <label class="scenarios-create__label">
        Введите название сценария
      </label>
      <input v-model="scenarioName" class="scenarios-create__search-input" type="text" placeholder="Название сценария" required>
    </div>
    <div class="scenarios-create__selected-list">
      <ui-button class="scenarios-create__label" @click="isAddDevice = true">
        Выбранные устройства 
        <ui-icon class="scenarios-create__label-icon" name="plus" size="20" />
      </ui-button>
      <div
        v-for="groupId in Object.keys(selectedDevice)"
        :key="groupId"
        class="scenarios-create__selected-list-group"
      >
        <h3 
          v-show="selectedDevice[groupId]?.length" 
          class="scenarios-create__selected-list-group-header"
        >
          {{ roomsName[groupId] }}
        </h3>
        <div 
          v-show="selectedDevice[groupId]?.length" 
          class="scenarios-create__selected-list-group-devices"
        >
          <scenario-service
            v-for="service in selectedDevice[groupId]"
            :id="service.id"
            :key="service.id"
            :is-preview="false"
            :name="service.name"
            :capabilities="service.capabilities"
            :type="service.type"
            :group-id="service.groupId"
            :device-icon="service.deviceIcon"
            :is-show-delete-icon="true"
            @left-mouse-click="e => {useScenarioSelectDevice(e, selectedDevice, capabilities, data)}"
            @update-capability="e => {useScenarioSetCapability(e, capabilities)}"
            @toggle-device="e => {turnOnDevice(e, selectedDevice, groupId)}"
          />
        </div>
      </div>
    </div>
    <transition name="add-menu">
      <div v-if="isAddDevice" class="scenarios-create__add">
        <div class="scrollable-content">
          <div class="scenarios-create__add-bg">
            <div class="scenarios-create__add__close">
              <ui-icon style="cursor: pointer;" name="close" @click="isAddDevice = !isAddDevice" />
            </div>
            <h1 class="scenarios-create__add__header">
              Добавить устройсво
            </h1>
            <group-list
              v-for="groups in filteredGroups"
              :id="groups.id"
              :key="groups.id"
              :devices="groups?.devices"
              :inverse-parent="groups.inverseParent"
              :name="groups?.name"
              :hide-empty="true"
              :is-scenarios="true"
              :hide-sensors="true"
              @get-data="e=>{useScenarioSelectDevice(e,selectedDevice,capabilities,data)}"
            />
          </div>
        </div>
      </div>
    </transition>
    <div class="scenarios-create__buttons">
      <ui-button class="scenarios-create__button" variant="secondary" @click="useGoToPreviousPage">
        Отменить
      </ui-button>
      <ui-button class="scenarios-create__button" variant="primary" @click="createScenario()">
        Сохранить
      </ui-button>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useGroupsStore } from "~/store/groups"
import type { ServiceProps } from "~/components/Service/TheService.vue"
import ScenarioService from "~/components/Scenarios/ScenarioService.vue"
import type { IGroupResponseItem } from "~/api/group/getAll"
import { useScenarioStore } from "~/store/scenario"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import useScenarioExpandGroups from "~/composables/useScenarioExpandGroups"
import useScenarioSelectDevice from "~/composables/useScenarioSelectDevice"

const groupStore = useGroupsStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const isLoading = ref(true)
const data = ref(await groupStore.getGroupById(groupStore.currentHome))
isLoading.value = false
const selectedDevice = ref<{ [key:string]: ServiceProps[] }>({})
const capabilities = ref<{ [key: string]: ServiceProps['capabilities'][] }>({})
const roomsName:{[key:string]:string} = {}
const scenarioName = ref('')
const isAddDevice = ref(false)
const searchGroupInput = ref('')
const flatGroupsArray = ref<IGroupResponseItem[]>(useScenarioExpandGroups(data.value))
const filteredGroups = computed(() => flatGroupsArray.value.filter(el => el.name?.toLowerCase().includes(searchGroupInput.value.toLowerCase())))

function getRoomsName (data:IGroupResponseItem) {
  roomsName[data?.id as string] = data.name
  for (let i = 0; i < data.inverseParent?.length; i++) {
    getRoomsName(data.inverseParent[i])
  }
}
getRoomsName(data.value)
const turnOnDevice = (e:any, selectedDevice: {[p: string]: ServiceProps[]}, id:any) => {
  const deviceIdx = selectedDevice[id].findIndex(el => el.id === e.id)
  if (deviceIdx > -1) {
    const capabilityIdx = selectedDevice[id][deviceIdx].capabilities?.findIndex(el => el.type === 'devices.capabilities.on_off')
    if (capabilityIdx === -1) {
      const capabilityIdx1 = selectedDevice[id][deviceIdx].capabilities?.findIndex(el => el.type === 'devices.capabilities.range')
      selectedDevice[id][deviceIdx].capabilities[capabilityIdx1].value === 'open' ? selectedDevice[id][deviceIdx].capabilities[capabilityIdx1].value = 'close' : selectedDevice[id][deviceIdx].capabilities[capabilityIdx1].value = 'open'
      const idx = `${e.id}`
      capabilities.value[idx][capabilityIdx1].value = selectedDevice[id][deviceIdx].capabilities[capabilityIdx1].value
    }
    if (typeof capabilityIdx !== 'undefined' && capabilityIdx > -1 && selectedDevice[id][deviceIdx].capabilities[capabilityIdx]) {
      selectedDevice[id][deviceIdx].capabilities[capabilityIdx].value = e.state
      const idx = `${e.id}`
      capabilities.value[idx][capabilityIdx].value = selectedDevice[id][deviceIdx].capabilities[capabilityIdx].value
    }
  }
}
async function createScenario () {
  if (!scenarioName.value?.length) {
    useNotification('error', 'Введите название сценария')
    return
  }
  if (scenarioName.value.length > 30) {
    useNotification("error", "Название сценария не должно превышать 30 символов")
    return
  }
  if (!Object.entries(capabilities.value).length) {
    useNotification('error', 'Не выбраны устройства')
    return
  }

  isLoading.value = true
  await useScenarioStore().createScenario({ name: scenarioName.value, homeId: groupStore.currentHome, devicesValueStates: capabilities.value })
  isLoading.value = false
}

</script>

<style lang="scss">
@import "assets/styles/page/scenarios-create";

.add-menu-enter-active,
.add-menu-leave-active {
  transition: all 0.5s ease;
}

.add-menu-enter-from,
.add-menu-leave-to {
  transform: translateY(-100%);
}

.add-menu-enter-to,
.add-menu-leave-from {
  transform: translateY(0);
}
</style>
