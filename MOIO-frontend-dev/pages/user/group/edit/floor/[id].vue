<template>
  <div class="add-group --edit">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Изменить этаж
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="editGroup()">
      <div class="add-group__input-group">
        <div class="add-group__input-group-flex">
          <label for="group" class="add-group__label">Название этажа</label>
          <div class="add-group__input-group-flexrow">
            <span class="add-group__name" v-show="!isNameChanging">{{ name }}</span>
            <input
              v-show="isNameChanging"
              id="group"
              v-model="name"
              type="text"
              name="group"
              class="add-group__input"
              placeholder="Название этажа"
              required
            >
            <ui-button
              v-show="!isNameChanging"
              @click="isNameChanging=!isNameChanging"
            >
              <ui-icon name="pencil" size="24" color="$color-icon-hover" />
            </ui-button>

            <ui-button
              v-show="isNameChanging"
              @click="isNameChanging=!isNameChanging"
            >
              <ui-icon name="check" size="24" color="$color-icon-hover" />
            </ui-button>
          </div>
          <button class="add-group__delete" type="button" @click="isModalOpen = true">
            <ui-icon
              size="20"
              name="delete"
            />
            Удалить этаж
          </button>
          <delete-confirmation :is-modal-open="isModalOpen" @cancel="isModalOpen = false" @delete="deleteGroup">
            <template #heading>
              Удалить этаж?
            </template>
            <template #description>
              Также будут удалены комнаты. Все устройства, находящиеся на этаже, будут перемещены перемещены к нераспределенным устройствам
            </template>
          </delete-confirmation>
        </div>
      </div>
      <div v-if="house?.length>1 && existingDevices?.length" class="add-group__input-group-flex">
        <button class="add-group__label blank" @click.prevent="addDevice = !addDevice">
          Аксессуары
          <ui-icon
            class="add-group__label-icon"
            name="plus"
          />
        </button>
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
          />
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
      </div>
      <div v-if="previewData.users?.length" class="add-group__input-group-flex add-group__preview-section">
        <div class="add-group__label">
          Гости
        </div>
        <div class="profile-roommates-section__list">
          <profile-roommates
            v-for="user in users"
            :id="user.id"
            :key="user.id"
            :name="user.name"
            :login="user.login"
            :groups="user.groupsIsPending"
            :is-pending="user.isPending"
            :is-change="true"
            @remove-user="getRoommates()"
            @user-for-remove="removeUser(user)"
          />
        </div>
        <ui-modal
          ref="addRoommateModal"
          :is-shown="groupStore.isAddRoommates"
          backdrop-filter="blur(3px)"
          transition-fade-name="fade"
          transition-content-name="translate"
          place=".layout"
          width="528px"
          @click-outside="groupStore.isAddRoommates = false"
        >
          <template #inner>
            <add-roommate-modal
              @modal-close="groupStore.isAddRoommates = false"
              @add-roommate="getRoommates()"
            />
          </template>
        </ui-modal>
      </div>
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
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import DeleteConfirmation from "~/components/DeleteConfirmation/DeleteConfirmation.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import UiButton from "~/components/ui/UiButton.vue"
import useDataForGroupEdit from "~/composables/useDataForGroupEdit"
import useEditGroup from "~/composables/useEditGroup"
import ScenarioService from "~/components/Scenarios/ScenarioService.vue"
import type { IAllDevicesResponse } from "~/api/device/getAll"
import type { IUsersByGroupResponse } from '~/api/group/getUsersByGroupId'

const id = useRoute().params.id as string

const editFetch = await useAsyncData(
    `editGp-${id}`,
    () => useEditGroup(id, name.value, oldName, usersForRemove.value, existingDevices.value, devices.value),
    { immediate: false },
)

const groupFetch = useLazyAsyncData(
  `groupById-${id}`,
  () => useDataForGroupEdit(id),
  { immediate: false },
)

const deleteFetch = await useAsyncData(
  `deleteGp-${id}`,
  () => groupStore.deleteGroup(id),
  { immediate: false },
)

let oldName = ''
const groupStore = useGroupsStore()
const { currentHome } = storeToRefs(groupStore)
const name = ref('')
const house = ref(currentHome)
const addDevice = ref(false)
const devices = ref<IAllDevicesResponse[]>([])
const existingDevices = ref<IAllDevicesResponse[]>([])
const users = ref<IUsersByGroupResponse[]>([])
const usersForRemove = ref<IUsersByGroupResponse[]>([])
const isNameChanging = ref(false)

const roommatesFetch = useLazyAsyncData(
  'groupUsers',
  () => groupStore.getUsersByGroupId(groupStore.currentHome),
)

async function getRoommates () {
  await roommatesFetch.refresh()
}
const previewData = ref({
  name,
  devices,
  users,
})
const isModalOpen = ref(false)

const checkIfDeviceChecked = (deviceId: string) => devices.value.findIndex(device => device.id === deviceId) > -1

const isLoading = computed(() =>
  (deleteFetch.pending.value && deleteFetch.status.value !== 'idle') ||
    (editFetch.pending.value && editFetch.status.value !== 'idle') ||
    (groupFetch.pending.value))

async function mapGroupData () {
  await groupFetch.execute()
  const data = groupFetch.data.value
  if (data) {
    const { inGroupDevices, inHouseDevices, groupName, inGroupUsers, groupHouse } = data
    name.value = groupName
    oldName = groupName
    devices.value = inGroupDevices
    existingDevices.value = inHouseDevices.concat(inGroupDevices)
    users.value = inGroupUsers
    house.value = groupHouse
  }
}
mapGroupData()
const removeUser = (user: IUsersByGroupResponse) => {
  usersForRemove.value.push({id:user.userId, name:user.name} as IUsersByGroupResponse);
  users.value.splice(users.value.findIndex(existingUser=>existingUser.id === user.userId),1)
}
async function editGroup () {
  await editFetch.execute()
  if (editFetch.status.value === 'success') {
    useNotification('info', 'Изменения успешно сохранены')
    setTimeout(() => {
      useRouter().push({ path: '/user/group/' + id })
    }, 900)
  }
}
async function deleteGroup () {
  await deleteFetch.execute()
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
@import "assets/styles/page/_user";

</style>
