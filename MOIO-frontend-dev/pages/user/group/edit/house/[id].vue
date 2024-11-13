<template>
  <div class="add-group --edit">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Изменить дом
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="editGroup()">
      <div class="add-group__input-group">
        <div class="add-group__input-group-flex">
          <label for="group" class="add-group__label">Название дома</label>
          <div class="add-group__input-group-flexrow">
            <span class="add-group__name" v-show="!isNameChanging">{{ name }}</span>
            <input
              v-show="isNameChanging"
              id="group"
              v-model="name"
              type="text"
              name="group"
              class="add-group__input"
              placeholder="Название дома"
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
          <button class="add-group__delete" type="button" @click="isModalOpen = true">
            <ui-icon
              size="20"
              name="delete"
            />
            Удалить дом
          </button>
          <delete-confirmation :is-modal-open="isModalOpen" @cancel="isModalOpen = false" @delete="deleteGroup">
            <template #heading>
              Удалить дом?
            </template>
            <template #description>
              Также будут удалены этажи, комнаты. Все устройства, находящиеся в доме, будут перемещены к нераспределенным устройствам
            </template>
          </delete-confirmation>
        </div>
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
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import DeleteConfirmation from "~/components/DeleteConfirmation/DeleteConfirmation.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import AddRoommateModal from "~/components/Profile/AddRoommateModal.vue"
import useDataForGroupEdit from "~/composables/useDataForGroupEdit"
import useEditGroup from "~/composables/useEditGroup"
import { useUserStore } from "~/store/user"
import ProfileRoommates from "~/components/Profile/ProfileRoommates.vue"
import type { IUsersByGroupResponse } from '~/api/group/getUsersByGroupId'

const userStore = useUserStore()
const groupStore = useGroupsStore()
const addRoommateModal = ref(null)
const roommatesFetch = useLazyAsyncData(
  'groupUsers',
  () => groupStore.getUsersByGroupId(groupStore.currentHome),
)

storeToRefs(userStore)

async function getRoommates () {
  await roommatesFetch.refresh()
}

let oldName = ''
const isLoading = ref(false)
const isNameChanging = ref(false)
const id = useRoute().params.id as string
const name = ref('')
const house = ref("")
const users = ref<IUsersByGroupResponse[]>([])
const usersForRemove = ref<IUsersByGroupResponse[]>([])
const previewData = ref({
  name,
  users,
})
const isModalOpen = ref(false)

async function getGroupData () {
  isLoading.value = true
  const { groupName, inGroupUsers } = await useDataForGroupEdit(id)
  isLoading.value = false
  users.value = inGroupUsers
  house.value = id
  name.value = groupName
  oldName = groupName
}
getGroupData()
const removeUser = (user: IUsersByGroupResponse) => {
  usersForRemove.value.push({id:user.userId, name:user.name} as IUsersByGroupResponse);
  users.value.splice(users.value.findIndex(existingUser=>existingUser.id === user.userId),1)
}
async function editGroup () {
  isLoading.value = true
  const isSuccess = await useEditGroup(id, name.value, oldName, usersForRemove.value)
  await groupStore.getHouses()
  isLoading.value = false
  if (isSuccess) {
    setTimeout(() => {
      useRouter().push({ path: '/' })
    }, 900)
  }
}
async function deleteGroup () {
  await groupStore.deleteGroup(id, true)
}


</script>
<style lang="scss">
@import "assets/styles/page/user-add-room";
</style>
