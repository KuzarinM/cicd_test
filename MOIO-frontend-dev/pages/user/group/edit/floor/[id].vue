<template>
  <div class="add-group --edit">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Изменить этаж
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="editGroup()">
      <div class="add-group__input-group">
        <div class="add-group__input-group-flexrow">
          <span v-show="!isNameChanging">{{ name }}</span>
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
            class-name="blank"
            padding="0"
            @click="isNameChanging=!isNameChanging"
          >
            <ui-icon name="pencil" size="24" color="$color-icon-hover" />
          </ui-button>

          <ui-button
            v-show="isNameChanging"
            class-name="blank"
            padding="0"
            @click="isNameChanging=!isNameChanging"
          >
            <ui-icon name="check" size="24" color="$color-icon-hover" />
          </ui-button>
        </div>
      </div>
      <form method="post" @submit.prevent="deleteGroup()">
        <button class="add-group__delete" type="submit">
          <ui-icon
            size="20"
            name="delete"
          />
          Удалить этаж
        </button>
      </form>
      <div v-if="house?.length>1 && existingDevices?.length" class="add-group-available-devices">
        <h2 class="add-group-available-devices__header">
          Аксессуары
          <ui-icon name="plus" style="cursor: pointer;" @click="addDevice = !addDevice" />
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
        <div v-if="existingDevices?.length>0" class="add-group-available-devices__list">
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
      <div v-if="users?.length" class="add-group__preview">
        <div class="add-group__preview-section">
          <div class="add-group__preview-section-title">
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
              @user-for-remove="(e)=>{
                usersForRemove.push({id:user.id,name:user.name} as IUsersByGroupResponse);
                users.splice(users.findIndex(el=>el.id === user.id),1)
              }"
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
      </div>
      <div class="add-group__buttons">
        <ui-button class="add-group__button" variant="secondary" @click="cancelEdit">
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
import UiIcon from "~/components/ui/UiIcon.vue"
import UiButton from "~/components/ui/UiButton.vue"
import useDataForGroupEdit from "~/composables/useDataForGroupEdit"
import useEditGroup from "~/composables/useEditGroup"
import AnyCheckbox from "~/components/shared/AnyCheckbox.vue"
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

const cancelEdit = () => {
  navigateTo(`/user/group/${id}`)
}

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
