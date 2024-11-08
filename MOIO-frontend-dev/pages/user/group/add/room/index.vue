<template>
  <div class="add-group">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Добавить комнату
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="addGroup()">
      <div class="add-group__input-group">
        <label for="group" class="add-group__label">Введите название комнаты</label>
        <input id="group" v-model="name" type="text" name="group" class="add-group__input" required placeholder="Название комнаты">
      </div>
      <div v-if="existingHouses?.length" class="add-group__input-group">
        <label for="house" class="add-group__label">Выберите дом</label>
        <ui-select
          :options="selectData"
          :current-value="house"
          select-name="Выберите дом"
          @custom-select="(e)=>house = e"
        />
      </div>
      <div v-if="floors?.length>0" class="add-group__input-group">
        <label for="floor" class="add-group__label">Выберите этаж</label>
        <div v-for="item in floors" :key="item.id" class="add-group__input-wrapper">
          <span
            :class="`floor-label ${item.id === floor?'--active':''}`"
            role="radio"
            @click="floor = item.id"
          >
            {{ item.name }}
          </span>
        </div>
      </div>
      <div v-if="name?.length" class="add-group-available-devices">
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
                @check="(e)=>useSetItemOnCheckbox(e,devices,{id:device.id,name:device.name})"
              />
            </template>
          </ui-any-list-item>
        </div>
      </div>
      <div class="add-group__preview-wrapper">
        <div v-if="previewData.name?.length" class="add-group__preview">
          <div class="add-group__preview-section">
            <div class="add-group__preview-section-title">
              Название комнаты
            </div>
            <div class="add-group__preview-section-value">
              {{ previewData.name }}
            </div>
          </div>
          <div class="add-group__preview-section">
            <div class="add-group__preview-section-title">
              Устройства комнаты
            </div>
            <div v-if="previewData.devices?.length" class="add-group__preview-section-value">
              <ui-any-list-item v-for="item in previewData.devices" :key="item.id">
                <template #title>
                  {{ item?.name }}
                </template>
                <template #action>
                  <ui-button
                    padding="0"
                    class-name="blank"
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
import UiSelect, { type ISelectProps } from "~/components/ui/UiSelect.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import useSetItemOnCheckbox from "~/composables/useSetItemOnCheckbox"

const groupStore = useGroupsStore()
const isLoading = ref(false)
const { floors, upGroups } = storeToRefs(groupStore)
const name = ref('')
const floor = ref('')
const house = ref('')
const devices = ref<{ id: string, name:string }[]>([])

const existingHouses = ref()
const existingDevices = ref()
const selectData = computed(() => existingHouses.value?.reduce((acc:{description:string, value:string}[], curr:{name:string, id:string}) => [...acc, { description: curr.name, value: curr.id }], []))
existingHouses.value = upGroups.value.filter(el => el.groupCreatorId === useUserStore().id)

const previewData = ref({
  name,
  devices,
})


async function getDevicesByGroupId () {
  isLoading.value = true
  existingDevices.value = []
  await groupStore.getDevicesByGroupId(house.value.length ? house.value : groupStore.currentHome)
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
  if (house.value.length) {
    parent = house.value
  }
  if (floor.value.length) {
    parent = floor.value
  }
  await groupStore.addRoom(name.value, 3, parent, devicesArrayId, undefined)
  isLoading.value = false
//   TODO отправить пользователя в свежесозаднную комнату. Будет сделано после рефакторинга бека
}
watch(house, () => {
  getDevicesByGroupId()
  groupStore.getAll(house.value)
})

</script>
<style lang="scss">
@import "assets/styles/page/_user-add-room";
</style>
