<template>
  <div class="scenarios-create">
    <loader-screen :is-loading="isLoading" />
    <h1 class="scenarios-create__header">
      Редактирование сценария
    </h1>
    <div class="scenarios-create__search">
      <label for="scenario-name">
        Введите название сценария
      </label>
      <input v-model="scenarioName" type="text" placeholder="Название сценария" required>
    </div>
    <div class="scenarios-create__selected-list">
      <h2 class="scenarios-create__selected-list-header">
        Выбранные устройства
      </h2>
      <div
        class="scenarios-create__selected-list-group"
      >
        <div class="scenarios-create__selected-list-group-devices">
          <scenario-service
            v-for="service in selectedDevice"
            :id="service.id"
            :key="service.id"
            :is-preview="false"
            :name="service.name"
            :capabilities="service.capabilities"
            :type="service.type"
            :group-id="''"
            :device-icon="service.deviceIcon??useIcoByDeviceType(service.type)"
            @left-mouse-click="e=>{selectDevice({...e,id:service.id});useScenarioToggleSelected(service.id, data)}"
            @update-capability="e=>{useScenarioSetCapability(e,capabilities)}"
          />
        </div>
      </div>
    </div>
    <div class="scenarios-create__available">
      <h2 class="scenarios-create__available-header">
        Доступные устройства
      </h2>
      <div class="scenarios-create__search">
        <label for="search-group">Поиск комнаты</label>
        <input id="search-group" v-model="searchGroupInput" type="search" placeholder="Комната">
      </div>
      <div v-if="filteredGroups.length" class="scenarios-create__available-list">
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
          @get-data="e=>{selectDevice(e);useScenarioToggleSelected(e.id, data)}"
        />
      </div>
      <div v-else class="scenarios-create__available-list --empty">
        <h2>Группа не найдена</h2>
      </div>
    </div>
    <div class="scenarios-create__save">
      <ui-button
        rounded="16px"
        margin-inline="0"
        @click="updateScenario"
      >
        Сохранить
      </ui-button>
      <ui-button
        class-name="delete"
        rounded="16px"
        margin-inline="0"
        @click="deleteScenario()"
      >
        Удалить
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
import type { GroupList } from "~/components/Group/GroupList.vue"
import { useScenarioStore } from "~/store/scenario"
import type { IScenarioUpdateProps } from "~/api/scenarios/update"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import useScenarioExpandGroups from "~/composables/useScenarioExpandGroups"
import useScenarioToggleSelected from "~/composables/useScenarioToggleSelectedState"

const groupStore = useGroupsStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const isLoading = ref(true)
const data = ref(await groupStore.getGroupById(groupStore.currentHome))
isLoading.value = false
const selectedDevice = ref<ServiceProps[]>([])
const capabilities = ref<{ [key: string]: ServiceProps['capabilities'][] }>({})
const roomsName:{[key:string]:string} = {}
const scenarioName = ref('')
const searchGroupInput = ref('')
const devicesForRemove = ref<string[]>([])
const flatGroupsArray = ref<IGroupResponseItem[]>(useScenarioExpandGroups(data.value))
const filteredGroups = computed(() => flatGroupsArray.value.filter(el => el.name?.toLowerCase().includes(searchGroupInput.value.toLowerCase())))

function selectDevice (service:ServiceProps) {
  const isDeviceExist = selectedDevice.value?.findIndex(el => el.id === service.id)
  if (isDeviceExist > -1) {
    selectedDevice.value.splice(isDeviceExist, 1)
    delete capabilities.value[service.id]
    devicesForRemove.value.push(service.id)
  } else {
    const removeIdx = devicesForRemove.value.findIndex(el => el === service.id)
    devicesForRemove.value.splice(removeIdx, 1)
    if (selectedDevice.value?.length > 0) {
      selectedDevice.value.push(service)
    } else {
      selectedDevice.value = [service]
    }
    capabilities.value[service.id] = service.capabilities
  }
}



function getRoomsName (data:IGroupResponseItem) {
  roomsName[data?.id as string] = data.name
  for (let i = 0; i < data.inverseParent?.length; i++) {
    getRoomsName(data.inverseParent[i])
  }
}
getRoomsName(data.value)
const router = useRoute()
const scenarioStore = useScenarioStore()
async function getData () {
  isLoading.value = true
  const response = await scenarioStore.getById(router.params.id as string)
  isLoading.value = false
  if (!response) {
    setTimeout(() => {
      useRouter().back()
    }, 900)
  }
  selectedDevice.value = response?.devicesScenarios ?? []
  scenarioName.value = response?.name as string
  selectedDevice.value?.forEach((el) => {
    useScenarioToggleSelected(el.id, data.value)
    if (capabilities.value[el.id] && el.capabilities) {
      capabilities.value[el.id].push(...el.capabilities)
    } else {
      capabilities.value[el.id] = el.capabilities
    }
  })
}
getData()
async function updateScenario () {
  if (!scenarioName.value?.length) {
    useNotification("error", "Введите название сценария")
    return
  }
  if (scenarioName.value.length > 30) {
    useNotification('error', 'Название сценария не должно превышать 30 символов')
    return
  }
  if (!Object.entries(capabilities.value)?.length) {
    useNotification("error", "Не выбрано ни одного устройства")
    return
  }
  isLoading.value = true
  const updateData:IScenarioUpdateProps = {
    id: router.params.id as string,
    name: scenarioName.value,
    devicesValueStates: capabilities.value,
    removeDevicesId: devicesForRemove.value,
  }
  await scenarioStore.updateScenario(updateData)

  isLoading.value = false
}

async function deleteScenario () {
  await scenarioStore.deleteScenario(router.params.id as string)
}
</script>

<style lang="scss">
@import "assets/styles/page/scenarios-create";
</style>
