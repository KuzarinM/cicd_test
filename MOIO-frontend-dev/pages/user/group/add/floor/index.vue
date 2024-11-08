<template>
  <div class="add-group">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Добавить этаж
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="addGroup()">
      <div class="add-group__input-group">
        <label for="group" class="add-group__label">Введите название этажа</label>
        <input id="group" v-model="name" type="text" name="group" class="add-group__input" required placeholder="Название этажа">
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
      <h2 v-if="existingDevices.length == 0 && isAddDevice" style="margin-top: 30px;">
        Нет доступных девайсов
      </h2>
      <div v-if="existingDevices?.length" class="add-group-available-devices">
        <div v-if="existingDevices?.length>0" class="add-group-available-devices__list">
          <transition name="add-room">
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
      <h2 class="add-group-available-devices__header">
        {{ existingRooms?.length?
          'Добавить комнату':
          'Комнаты уже распределены по этажам или не найдены'
        }}
        <ui-icon
          name="plus"
          style="cursor: pointer;"
          @click="isAddRoom = !isAddRoom"
        />
      </h2>
      <div
        v-for="room in rooms"
        :key="room.id"
        class="added__rooms"
      >
        {{ room.name }}
      </div>
      <transition name="add-room">
        <div v-if="isAddRoom" class="add-group-available-devices__add">
          <ui-icon class="add-group-available-devices__add-close" name="close" @click="isAddRoom = false" />
          <h2 class="add-group-available-devices__add-header">
            Добавить комнату
          </h2>
          <div class="add-group-available-devices__add-rooms">
            <any-checkbox
              v-for="item in existingRooms"
              :key="item.id"
              :is-checked="rooms.findIndex(el=>el.id === item.id)>-1"
              @check="(e)=>useSetItemOnCheckbox(e,rooms, {id:item.id,name:item.name})"
            >
              <template #item="">
                <div class="rooms">
                  {{ item.name }}
                </div>
              </template>
            </any-checkbox>
          </div>
        </div>
      </transition>
      <ui-button class="add-group__button add-group__button--long" variant="secondary" type="submit">
        Добавить
      </ui-button>
    </form>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import type { IAsideCategoryItem } from "~/components/Aside/AsideCategory.vue"
import AnyCheckbox from "~/components/shared/AnyCheckbox.vue"
import TheService from "~/components/Service/TheService.vue"
import type { IAllDevicesResponse } from "~/api/device/getAll"

const groupStore = useGroupsStore()
const isLoading = ref(false)
const name = ref('')
const house = ref(groupStore.currentHome)
const devices = ref<IAllDevicesResponse[]>([])
const rooms = ref<{ id: string, name:string }[]>([])
const existingRooms = ref<IAsideCategoryItem[]>()
const existingDevices = ref()
const addDevice = ref(false)
const isAddDevice = ref(false)
const isAddRoom = ref(false)
async function getRoomsByHomeId () {
  isLoading.value = true
  await groupStore.getAll(house.value)
  isLoading.value = false
  existingRooms.value = groupStore.rooms
}
getRoomsByHomeId()
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

async function getDevicesByGroupId () {
  isLoading.value = true
  existingDevices.value = []
  const { devices } = await groupStore.getGroupById(house.value)
  isLoading.value = false
  existingDevices.value = devices
}
getDevicesByGroupId()
async function addGroup () {
  isLoading.value = true
  if (!name.value?.length) {
    useNotification("error", "Введите название группы")
    return
  }
  if (name.value.length > 30) {
    useNotification("error", "Название группы не должно превышать 30 символов")
    return
  }
  const devicesArrayId = devices.value.map(el => el.id)
  const roomsArrayId = rooms.value.map(el => el.id)
  await groupStore.addGroup(name.value, groupStore.getGroupTypeId('Floor'), house.value, devicesArrayId?.length > 0 ? devicesArrayId : undefined, roomsArrayId.length > 0 ? roomsArrayId : undefined)
  isLoading.value = false
//   TODO отправить пользователя в комнату, которая только что создана. Будет сделано после refactoring бека
}
watch(house, () => {
  getDevicesByGroupId()
  getRoomsByHomeId()
})
</script>
<style lang="scss">
.rooms{
  border: 1px solid $color-border;
  height: 120px;
  border-radius: 12px;
  padding: 20px;
}
.added__rooms{
  display: flex;
  margin-top: 20px;
}
.add-room-enter-active,
.add-room-leave-active {
  transition: all 0.5s ease;
}

.add-room-enter-from,
.add-room-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.add-room-enter-to,
.add-room-leave-from {
  transform: translateY(0);
  opacity: 1;
}
@import "assets/styles/page/_user-add-room";
</style>
