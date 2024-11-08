<template>
  <div class="scenarios-create">
    <loader-screen :is-loading="isLoading" />
    <h1 class="scenarios-create__header">
      Создание сценария
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
        v-for="groupId in Object.keys(selectedDevice)"
        :key="groupId"
        class="scenarios-create__selected-list-group"
      >
        <h3 v-show="selectedDevice[groupId]?.length" class="scenarios-create__selected-list-group-header">
          {{ roomsName[groupId] }}
        </h3>
        <div v-show="selectedDevice[groupId]?.length" class="scenarios-create__selected-list-group-devices">
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
            @left-mouse-click="e=>{useScenarioSelectDevice(e,selectedDevice,capabilities,data)}"
            @update-capability="e=>{useScenarioSetCapability(e,capabilities);}"
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
          :hide-sensors="true"
          :is-scenarios="true"
          @get-data="e=>{useScenarioSelectDevice(e,selectedDevice,capabilities,data);}"
        />
      </div>
      <div v-else class="scenarios-create__available-list --empty">
        <h2>Группа не найдена</h2>
      </div>
    </div>
    <div class="scenarios-create__save">
      <ui-button rounded="16px" @click="createScenario()">
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
import useScenarioSetCapability from "~/composables/useScenarioSetCapability"
import useScenarioExpandGroups from "~/composables/useScenarioExpandGroups"


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

</style>
