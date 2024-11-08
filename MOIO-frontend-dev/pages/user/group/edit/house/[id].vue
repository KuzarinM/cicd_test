<template>
  <div class="add-group --edit">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Изменить дом
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
            placeholder="Название комнаты"
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
          Удалить дом
        </button>
      </form>
      <div v-if="house?.length>1" class="add-group-available-devices">
        <div class="add-group__preview-wrapper">
          <div v-if="users?.length" class="add-group__preview">
            <div class="add-group__preview-section">
              <div class="add-group__preview-section-title">
                Гости <ui-icon style="cursor: pointer;" name="plus" @click="groupStore.isAddRoommates = true" />
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
                    usersForRemove.push({id:user.id, name:user.name} as IUsersByGroupResponse);
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
                    @refresh-data="getGroupData()"
                  />
                </template>
              </ui-modal>
            </div>
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
      </div>
    </form>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
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

const cancelEdit = () => {
  navigateTo('/')
}

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
