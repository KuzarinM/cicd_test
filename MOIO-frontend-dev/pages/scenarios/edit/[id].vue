<template>
  <div class="scenarios-create">
    <loader-screen :is-loading="isLoading" />
    <h1 class="scenarios-create__header">
      Сценарии
    </h1>
    <div class="scenarios-create__search">
      <span class="scenarios-create__label">
        Название сценария
      </span>

      <div class="scenarios-create__flexrow">
        <span v-show="!isChangeName" class="scenarios-create__search-name">
          {{ scenarioName }}
        </span>
        <ui-button v-show="!isChangeName" @click="isChangeName = true">
          <ui-icon name="pencil"/>
        </ui-button>
        <input 
          class="scenarios-create__search-input" 
          v-show="isChangeName" 
          v-model="scenarioName" 
          type="text" 
          placeholder="Название сценария" 
          required
        />
        <ui-button v-show="isChangeName" @click="isChangeName = false">
          <ui-icon name="check"/>
        </ui-button>
      </div>
      <ui-button class="scenarios-create__test-button" @click="executeScenario">
        <ui-icon name="play" size="20" />Проверить сценарий
      </ui-button>
      <ui-button class="scenarios-create__test-button" @click="isModalOpen = true">
        <ui-icon name="delete" size="20" />Удалить сценарий
      </ui-button>
      <delete-confirmation 
        :is-modal-open="isModalOpen" 
        @cancel="isModalOpen = false" 
        @delete="deleteScenario()"
      >
        <template #heading>
          Удалить сценарий?
        </template>
        <template #description>
          Если этот сценарий был последний в какой-либо автоматизации, то эта автоматизация будет удалена
        </template>
      </delete-confirmation>
    </div>
    <div class="scenarios-create__selected-list">
      <ui-button class="scenarios-create__label" @click="isAddDevice = true">
        Выбранные устройства 
        <ui-icon class="scenarios-create__label-icon" name="plus" size="20" />
      </ui-button>
      <div class="scenarios-create__selected-list-group">
        <div class="scenarios-create__selected-list-group-devices">
          <scenario-service
            v-for="service in selectedDevice"
            :id="service.id"
            :key="service.id"
            :is-preview="false"
            :name="service.name"
            :capabilities="service.capabilities"
            :type="service.type"
            :group-id="service.groupId"
            :is-show-delete-icon="true"
            :device-icon="service.deviceIcon"
            @left-mouse-click="e=>{selectDevice({...e,id:service.id});useScenarioToggleSelected(service.id, data)}"
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
              @get-data="e=>{selectDevice(e);useScenarioToggleSelected(e.id, data)}"
            />
          </div>
        </div>
      </div>
    </transition>

    <div class="scenarios-create__buttons">
      <ui-button class="scenarios-create__button" variant="secondary" @click="useGoToPreviousPage">
        Отменить
      </ui-button>
      <ui-button class="scenarios-create__button" variant="primary" @click="updateScenario">
        Сохранить изменения
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
import GroupList from "~/components/Group/GroupList.vue"
import { useScenarioStore } from "~/store/scenario"
import type { IScenarioUpdateProps } from "~/api/scenarios/update"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import useScenarioExpandGroups from "~/composables/useScenarioExpandGroups"
import useScenarioToggleSelected from "~/composables/useScenarioToggleSelectedState"
import DeleteConfirmation from "~/components/DeleteConfirmation/DeleteConfirmation.vue"

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
const route = useRouter()
const isAddDevice = ref(false)
const isChangeName = ref(false)
const devicesForRemove = ref<string[]>([])
const flatGroupsArray = ref<IGroupResponseItem[]>(useScenarioExpandGroups(data.value))
const filteredGroups = computed(() => flatGroupsArray.value.filter(el => el.name?.toLowerCase().includes(searchGroupInput.value.toLowerCase())))
const executeScenarioFetch = useLazyAsyncData(
  'scenarios-exec',
  () => scenarioStore.executeScenario(route.currentRoute.value.params.id),
  { immediate: false })
executeScenarioFetch.pending.value = false
const isModalOpen = ref(false)

async function executeScenario () {
  await executeScenarioFetch.execute()
  await nextTick(() => {
  })
}

const turnOnDevice = (e:any) => {
  const deviceIdx = selectedDevice.value.findIndex(el => el.id === e.id)
  if (deviceIdx > -1) {
    const capabilityIdx = selectedDevice.value[deviceIdx].capabilities?.findIndex(el => el.type === 'devices.capabilities.on_off')
    if (capabilityIdx > -1) {
      selectedDevice.value[deviceIdx].capabilities[capabilityIdx].value = e.state
    }
    if (capabilityIdx === -1) {
      const capabilityIdx1 = selectedDevice.value[deviceIdx].capabilities?.findIndex(el => el.type === 'devices.capabilities.range')
      selectedDevice.value[deviceIdx].capabilities[capabilityIdx1].value === 'open' ? selectedDevice.value[deviceIdx].capabilities[capabilityIdx1].value = 'close' : selectedDevice.value[deviceIdx].capabilities[capabilityIdx1].value = 'open'
    }
  }
}

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
