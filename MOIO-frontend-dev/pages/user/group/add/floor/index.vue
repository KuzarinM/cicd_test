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
      <div v-if="existingDevices.length" class="add-group__input-group-flex">
        <button class="add-group__label blank" @click.prevent="addDevice = true">
          Аксессуары
          <ui-icon
            class="add-group__label-icon"
            name="plus"
          />
        </button>
        <div class="add-group-available-devices-now" v-show="devices.length">
          <the-service
            v-for="device in devices"
            :id="device.id"
            :key="device.id"
            :type="device.type"
            :name="device.name"
            :capabilities="device.capabilities"
            :device-icon="device.deviceIcon"
          />
        </div>
      </div>
      <transition name="add-room">
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
      <div class="add-group__input-group-flex">
        <button v-if="existingRooms?.length" class="add-group__label blank" @click.prevent="isAddRoom = !isAddRoom">
          Добавить комнату
          <ui-icon class="add-group__label-icon" name="plus"/>
        </button>
        <span v-else class="add-group__label">Комнаты уже распределены по этажам или не найдены</span>
        <div class="added__rooms" v-show="rooms.length">
          <div v-for="room in rooms" class="added__room-item">
            <ui-icon name="aside/room" />
            {{ room.name }}
          </div>
        </div>
      </div>
      <transition name="add-room">
        <div v-if="isAddRoom" class="add-group-available-devices__add">
          <div class="scrollable-content">
            <ui-icon class="add-group-available-devices__add-close" name="close" @click="isAddRoom = false" />
            <h2 class="add-group-available-devices__add-header">
              Добавить комнату
            </h2>
            <div class="add-group-available-devices__add-rooms">
              <any-checkbox
                v-for="room in existingRooms"
                :key="room.id"
                :is-checked="rooms.findIndex(el=>el.id === room.id)>-1"
                @check="(e)=>useSetItemOnCheckbox(e, rooms, {id:room.id,name:room.name})"
              >
                <template #item="{isChecked}">
                  <div class="rooms">
                    {{ room.name }}
                  </div>
                </template>
              </any-checkbox>
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
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import type { IAsideCategoryItem } from "~/components/Aside/AsideCategory.vue"
import AnyCheckbox from "~/components/shared/AnyCheckbox.vue"
import TheService from "~/components/Service/TheService.vue"
import ScenarioService from "~/components/Scenarios/ScenarioService.vue"
import type { IAllDevicesResponse } from "~/api/device/getAll"

const groupStore = useGroupsStore()
const isLoading = ref(false)
const name = ref('')
const house = ref(groupStore.currentHome)
const devices = ref<IAllDevicesResponse[]>([])
const rooms = ref<{ id: string, name:string }[]>([])
const existingRooms = ref<IAsideCategoryItem[]>()
  const existingDevices = ref<IAllDevicesResponse[]>([])
const addDevice = ref(false)
const isAddRoom = ref(false)
async function getRoomsByHomeId () {
  isLoading.value = true
  await groupStore.getAll(house.value)
  isLoading.value = false
  existingRooms.value = groupStore.rooms
}
getRoomsByHomeId()

const checkIfDeviceChecked = (deviceId: string) => devices.value.findIndex(device => device.id === deviceId) > -1

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
.added{
  &__rooms{
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__room-item{
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    font-size: 18px;
  }
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
