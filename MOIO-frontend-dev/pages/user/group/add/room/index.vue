<template>
  <div class="add-group">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Добавить комнату
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="addGroup()">
      <div class="add-group__input-group">
        <div class="add-group__input-group-flex">
          <label for="group" class="add-group__label">Название комнаты</label>
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
      <div v-if="floors?.length>0" class="add-group__input-group">
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
      <h2 class="add-group-available-devices__header">
        Аксессуары
        <ui-icon
          name="plus"
          style="cursor: pointer;"
          @click="addDevice = !addDevice"
        />
      </h2>
      <div class="add-group-available-devices-now">
        <the-service
          v-for="device in devices"
          :id="device.id"
          :key="device.id"
          :type="device.type"
          :device-custom-type="device.deviceCustomType"
          :name="device.name"
          :capabilities="device.capabilities"
          :device-icon="device.deviceIcon"
          @update-device="updateCapability(device.id)"
        />
      </div>
      <h2 v-if="existingDevices.length == 0 && isAddDevice" style="margin-top: 40px;">
        Нет доступных девайсов
      </h2>
      <div class="add-group-available-devices">
        <div class="add-group-available-devices__list">
          <transition name="add-menu">
            <div v-if="addDevice" class="add-group-available-devices__add">
              <h2 class="add-group-available-devices__add-header">
                Добавить устройство
              </h2>
              <ui-icon class="add-group-available-devices__add-close" name="close" @click="addDevice = false" />
              <div class="add-group-available-devices__add-flex">
                <any-checkbox
                  v-for="item in existingDevices"
                  :key="item.id"
                  :is-checked="devices.findIndex(el=>el.id === item.id)>-1"
                  @check="(e)=>useSetItemOnCheckbox(e,devices, {id:item.id,name:item.name,type:item.type,capabilities:item.capabilities})"
                >
                  <template #item="">
                    <the-service
                      v-bind="item"
                      :is-add-room="true"
                    />
                  </template>
                </any-checkbox>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <ui-button class="add-group__button add-group__button--long" variant="secondary" type="submit">
        Добавить
      </ui-button>
    </form>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import AnyCheckbox from "~/components/shared/AnyCheckbox.vue"
import TheService from "~/components/Service/TheService.vue"
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
const isAddDevice = ref(false)
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

const updateCapability = (id:any) => {
  const deviceIdx = devices.value.findIndex(el => el.id === id)
  if (deviceIdx > -1) {
    const capabilitiesIdx = devices.value[deviceIdx].capabilities.findIndex(el => el.type === 'devices.capabilities.on_off')
    if (capabilitiesIdx > -1) {
      devices.value[deviceIdx].capabilities[capabilitiesIdx].value === false ? devices.value[deviceIdx].capabilities[capabilitiesIdx].value = true : devices.value[deviceIdx].capabilities[capabilitiesIdx].value = false
    }
    if (capabilitiesIdx === -1) {
      const capabilitiesIdx1 = devices.value[deviceIdx].capabilities.findIndex(el => el.type === 'devices.capabilities.range')
      devices.value[deviceIdx].capabilities[capabilitiesIdx1].value === 'close' ? devices.value[deviceIdx].capabilities[capabilitiesIdx1].value = 'open' : devices.value[deviceIdx].capabilities[capabilitiesIdx1].value = 'close'
    }
  }
}

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
  await groupStore.getDevicesByGroupId(groupStore.currentHome)
  isLoading.value = false
  for (const category of Object.values(groupStore.devices)) {
    existingDevices.value.push(...category)
  }
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
  isLoading.value = false
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
