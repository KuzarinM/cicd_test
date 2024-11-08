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
      <div v-if="existingHouses?.length" class="add-group__input-group">
        <label for="house" class="add-group__label">Выберите дом </label>
        <ui-select
          :options="selectData"
          :current-value="house"
          select-name="Выберите дом"
          @custom-select="(e)=>house = e"
        />
      </div>
      <div v-if="house?.length>10 && name?.length" class="add-group-available-devices">
        <h2 class="add-group-available-devices__header">
          {{ existingDevices?.length?
            'Доступные устройства':
            'Устройства уже распределены по группам или не найдены'
          }}
        </h2>
        <div v-if="existingDevices?.length>0" class="add-group-available-devices__list">
          <ui-any-list-item
            v-for="device in existingDevices"
            :key="device.id"
          >
            <template #title>
              {{ device?.name }}
            </template>
            <template #action>
              <ui-checkbox
                :checked="devices.findIndex(el=>el.id === device.id)>-1"
                @check="(e)=>useSetItemOnCheckbox(e, devices, {id:device.id,name:device.name})"
              />
            </template>
          </ui-any-list-item>
        </div>
      </div>
      <div v-if="house?.length>10 && previewData.name?.length" class="add-group-available-devices">
        <h2 class="add-group-available-devices__header">
          {{ existingRooms?.length?
            'Доступные комнаты':
            'Комнаты уже распределены по этажам или не найдены'
          }}
        </h2>
        <div v-if="existingRooms?.length>0" class="add-group-available-devices__list">
          <ui-any-list-item
            v-for="room in existingRooms"
            :key="room.id"
          >
            <template #title>
              {{ room.name }}
            </template>
            <template #action>
              <ui-checkbox
                :checked="rooms.findIndex(el=>el.id === room.id)>-1"
                @check="(e)=>useSetItemOnCheckbox(e, rooms,{id:room.id,name:room.name})"
              />
            </template>
          </ui-any-list-item>
        </div>
      </div>
      <div class="add-group__preview-wrapper">
        <div v-if="previewData.name?.length" class="add-group__preview">
          <div class="add-group__preview-section">
            <div class="add-group__preview-section-title">
              Название этажа
            </div>
            <div class="add-group__preview-section-value">
              {{ previewData.name }}
            </div>
          </div>
          <div class="add-group__preview-section">
            <div class="add-group__preview-section-title">
              Устройства этажа
            </div>
            <div v-if="previewData.devices?.length" class="add-group__preview-section-value">
              <ui-any-list-item v-for="item in previewData.devices" :key="item.id">
                <template #title>
                  {{ item?.name }}
                </template>
                <template #action>
                  <ui-button
                    class-name="blank"
                    padding="0"
                    margin-inline="0"
                    @click="useSetItemOnCheckbox(false,devices,{id:item.id,name:item.name})"
                  >
                    <ui-icon
                      name="delete"
                      color="#D15151"
                      size="20"
                    />
                  </ui-button>
                </template>
              </ui-any-list-item>
            </div>
            <div v-else class="add-group__preview-section-value">
              Нет выбранных устройств
            </div>
          </div>
          <div class="add-group__preview-section">
            <div class="add-group__preview-section-title">
              Комнаты на этаже
            </div>
            <div v-if="previewData.rooms?.length" class="add-group__preview-section-value">
              <ui-any-list-item v-for="item in previewData.rooms" :key="item.id">
                <template #title>
                  {{ item?.name }}
                </template>
                <template #action>
                  <ui-button
                    class-name="blank"
                    padding="0"
                    margin-inline="0"
                    @click="useSetItemOnCheckbox(false,rooms,{id:item.id,name:item.name})"
                  >
                    <ui-icon
                      name="delete"
                      color="#D15151"
                      size="20"
                    />
                  </ui-button>
                </template>
              </ui-any-list-item>
            </div>
            <div v-else class="add-group__preview-section-value">
              Нет выбранных комнат
            </div>
          </div>
        </div>
      </div>
      <div class="add-group__submit-wrapper">
        <ui-button type="submit" rounded="16px">
          Добавить
        </ui-button>
      </div>
    </form>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import { useUserStore } from "~/store/user"
import UiSelect from "~/components/ui/UiSelect.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"

const groupStore = useGroupsStore()
const isLoading = ref(false)
const name = ref('')
const house = ref(groupStore.currentHome)
const devices = ref<{ id: string, name:string }[]>([])
const rooms = ref<{ id: string, name:string }[]>([])
const existingRooms = ref<{id:string, name:string}[]>()
const existingHouses = ref()
const existingDevices = ref()
const upperGroups = ref(groupStore.upGroups)
existingHouses.value = upperGroups.value.filter(el => el.groupCreatorId === useUserStore().id)
const selectData = ref(existingHouses.value.reduce((acc:{description:string, value:string}[], curr:{name:string, id:string}) => [...acc, { description: curr.name, value: curr.id }], []))
const previewData = ref({
  name,
  devices,
  rooms,
})
async function getRoomsByHomeId () {
  isLoading.value = true
  await groupStore.getAll(house.value)
  isLoading.value = false
  existingRooms.value = groupStore.rooms
}
getRoomsByHomeId()

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
  await groupStore.addRoom(name.value, 2, house.value, devicesArrayId?.length > 0 ? devicesArrayId : undefined, roomsArrayId.length > 0 ? roomsArrayId : undefined)
  isLoading.value = false
//   TODO отправить пользователя в свежесозаднную комнату. Будет сделано после рефакторинга бека
}
watch(house, () => {
  getDevicesByGroupId()
  getRoomsByHomeId()
  selectData.value = existingHouses.value.reduce((acc:{description:string, value:string}[], curr:{name:string, id:string}) => [...acc, { description: curr.name, value: curr.id }], [])
})
</script>
<style lang="scss">
@import "assets/styles/page/_user-add-room";
</style>
