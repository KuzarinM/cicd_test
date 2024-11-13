<template>
  <div class="add-group">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Добавить комнату
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="addGroup()">
      <div class="add-group__input-group">
        <div class="add-group__input-group-flex">
          <label for="group" class="add-group__label">Введите название комнаты</label>
          <input
            id="group"
            v-model="name"
            type="text"
            name="group"
            class="add-group__input"
            required placeholder="Название комнаты"
          >
        </div>
      </div>
      <div v-if="floors?.length" class="add-group__input-group">
        <div class="add-group__input-group-flex">
          <label for="house" class="add-group__label">Выберите этаж</label>
          <ui-select
            :options="selectData"
            :current-value="floor"
            select-name="Выберите этаж"
            @custom-select="(e)=>floor = e"
          />
        </div>
      </div>
      <div v-if="existingDevices.length"  class="add-group__input-group-flex">
        <button class="add-group__label blank" @click.prevent="addDevice = true">
          Аксессуары
          <ui-icon class="add-group__label-icon" name="plus"/>
        </button>
        <div class="add-group-available-devices-now" v-show="devices.length">
          <the-service
            v-for="device in devices"
            :id="device.id"
            :key="device.id"
            :type="device.type"
            :device-custom-type="device.deviceCustomType"
            :name="device.name"
            :capabilities="device.capabilities"
            :device-icon="device.deviceIcon"
          />
        </div>
      </div>
      <transition name="add-menu">
        <div v-if="addDevice" class="add-group-available-devices__add">
          <div class="scrollable-content">
            <h2 class="add-group-available-devices__add-header">
              Добавить устройство
            </h2>
            <ui-icon class="add-group-available-devices__add-close" name="close" @click="addDevice = false" />
            <div class="add-group-available-devices__add-flex">
              <scenario-service
                v-for="device in existingDevices"
                :key="device.id"
                v-bind="device"
                :selected="checkIfDeviceChecked(device.id)"
                :is-show-checkbox="true"
                :is-hide-capability-modal="true"
                @select-device="device => useSetItemOnCheckbox(!checkIfDeviceChecked(device.id), devices, device)"
              />
            </div>
          </div>
        </div>
      </transition>
      <div class="add-group__buttons">
        <ui-button class="add-group__button" variant="secondary" @click="useGoToPreviousPage">
          Отменить
        </ui-button>
        <ui-button class="add-group__button" variant="primary" type="submit">
          Сохранить
        </ui-button>
      </div>
    </form>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import TheService from "~/components/Service/TheService.vue"
import ScenarioService from "~/components/Scenarios/ScenarioService.vue"
import UiSelect, { type ISelectOption } from "~/components/ui/UiSelect.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import useSetItemOnCheckbox from "~/composables/useSetItemOnCheckbox"
import type { IAsideCategoryItem } from "~/components/Aside/AsideCategory.vue"
import type { IAllDevicesResponse } from "~/api/device/getAll"

const groupStore = useGroupsStore()
const isLoading = ref(false)
const { floors } = storeToRefs(groupStore)
const name = ref('')
const floor = ref(0)
const devices = ref<IAllDevicesResponse[]>([])
const addDevice = ref(false)
const existingDevices = ref<IAllDevicesResponse[]>([])

const selectData = computed(() =>
  floors.value?.reduce(
    (acc:ISelectOption[], curr:IAsideCategoryItem) => {
      acc.push({ description: curr.name, value: curr.id })
      return acc
    }, [{ description: 'Выберите этаж', value: 0 }] as ISelectOption[],
  ),
)

const groupFetch = useLazyAsyncData(
  `groupById-${groupStore.currentHome}`,
  () => useDataForGroupEdit(groupStore.currentHome),
  { immediate: false },
)

const checkIfDeviceChecked = (deviceId: string) => devices.value.findIndex(device => device.id === deviceId) > -1

async function getGroupData () {
  await groupFetch.execute()
  const data = groupFetch.data.value
  if (data) {
    const { inHouseDevices } = data
    existingDevices.value = inHouseDevices
  }
}

getGroupData()

async function getDevicesByGroupId () {
  isLoading.value = true
  existingDevices.value = []
  const { devices } = await groupStore.getGroupById(groupStore.currentHome)
  isLoading.value = false
  existingDevices.value = devices
}

getDevicesByGroupId()
async function addGroup () {
  if (!name.value?.length) {
    useNotification("error", "Введите название группы")
    return
  }
  if (name.value.length > 30) {
    useNotification("error", "Название группы не должно превышать 30 символов")
    return
  }
  isLoading.value = true
  const devicesArrayId = devices.value.map(el => el.id)
  let parent = groupStore.currentHome

  if (floor.value !== 0) {
    parent = String(floor.value)
  }

  await groupStore.addGroup(name.value, groupStore.getGroupTypeId('Room'), parent, devicesArrayId, undefined)
//   TODO отправить пользователя в комнату, которая создана только что. Будет сделано после refactoring бека
}


</script>
<style lang="scss">
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
@import "assets/styles/page/user-add-room";
</style>
