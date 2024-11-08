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
        Выбранные устройства <ui-icon style="cursor: pointer;" name="plus" size="20" @click="isAddDevice = !isAddDevice" />
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
            :is-automation="false"
            :type="service.type"
            :group-id="service.groupId"
            :device-icon="service.deviceIcon"
            @left-mouse-click="e=>{useScenarioSelectDevice(e,selectedDevice,capabilities,data)}"
            @update-capability="e=>{useScenarioSetCapability1(e,groupId)}"
            @toggle-device="e=>{turnOnDevice(e,selectedDevice,groupId)}"
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
      <ui-button class="scenarios-create__button" variant="secondary" @click="cancleScenario">
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
    console.log(capabilityIdx)
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

// Сохранение измененных состояний устройств при создании сценариев
function useScenarioSetCapability1 (data: any, id:any) {
  // TODO: Проверка нужна для разделения монолита и микро-сервисов
  // В дальнейшем от этого необходимо избавиться
  if (data.deviceId === data.chanel) {
    // Находим capability, нужную для изменения
    const capabilityId = capabilities.value[data.deviceId]?.findIndex(el => el?.type === data.type)

    if (capabilityId > -1) {
      // Обновляем capability
      capabilities.value[data.deviceId][capabilityId] = {
        ...capabilities.value[data.deviceId][capabilityId],
        value: data.value,
        hsv: data.hsv,
        range: data.range,
        instance: data.instance,
      }
    }

    // Если изменение яркости, то ищем нужную capability
    if (data.instance === 'brightness') {
      const colorId = capabilities.value[data.deviceId]
        ?.findIndex(el => el.type === 'devices.capabilities.color_setting')

      // Если нашли такой capability, то обновляем HSV
      if (colorId > -1) {
        capabilities.value[data.deviceId][colorId] = {
          ...capabilities.value[data.deviceId][colorId],
          hsv: {
            ...capabilities.value[data.deviceId][colorId].hsv,
            v: Number(data.value),
          },
        }
      }
    }

    const deviceId = selectedDevice.value[id].findIndex(el => el.id === data.deviceId)

    return selectedDevice.value[id][deviceId].capabilities[capabilityId] = capabilities.value[data.deviceId][capabilityId]
  } else {
    const capabilityIdx = capabilities.value[data.deviceId + '_ch' + data.chanel].findIndex(el => el.type === data.type)

    console.log('CapabilityId: ' + capabilityIdx)
    capabilities.value[data.deviceId + '_ch' + data.chanel][capabilityIdx] = {
      ...capabilities.value[data.deviceId + '_ch' + data.chanel][capabilityIdx],
      value: data.value,
      hsv: data.hsv,
      range: data.range,
      instance: data.instance,
    }
    if (data.instance?.includes('bright')) {
      const colorCapabilityIdx = capabilities.value[data.deviceId + '_ch' + data.chanel]
        ?.findIndex(el => el.type.includes('color'))
      if (colorCapabilityIdx > -1) {
        capabilities.value[data.deviceId + '_ch' + data.chanel][colorCapabilityIdx] = {
          ...capabilities.value[data.deviceId + '_ch' + data.chanel][colorCapabilityIdx],
          hsv: {
            ...capabilities.value[data.deviceId + '_ch' + data.chanel][colorCapabilityIdx].hsv,
            v: Number(data.value),
          },
        }
      }
    }
    const deviceIdx = selectedDevice.value[id].findIndex(el => el.id === data.deviceId + '_ch' + data.chanel)

    return selectedDevice.value[id][deviceIdx].capabilities[capabilityIdx] = capabilities.value[data.deviceId + '_ch' + data.chanel][capabilityIdx]
  }
}
const cancleScenario = () => {
  navigateTo({ path: '/scenarios' })
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
