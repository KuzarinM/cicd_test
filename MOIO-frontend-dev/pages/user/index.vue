<template>
  <div class="profile">
    <loader-screen
      :is-loading="
        roommatesFetch.pending.value||
          invitedHousesFetch.pending.value||
          (userFetch.pending.value)"
    />
    <profile-card
      :role="userInfo.role"
      :displayed-name="userInfo.name"
      :avatar-url="userInfo.avatarUrl"
      :client-id="userInfo.clientId"
      :login="userInfo.login"
    />
    <invitation-form />
    <div v-if="isHouseOwner" class="profile-roommates-section">
      <h1 class="profile-roommates-section__header">
        Жильцы и гости
      </h1>
      <div class="profile-roommates-section__list">
        <profile-roommates
          v-for="item in roommatesFetch.data.value"
          :id="item.id"
          :key="item.id"
          :name="item.name"
          :login="item.login"
          :groups="item.groupsIsPending"
          :is-pending="item.isPending"
          @remove-user="getRoommates()"
        />
      </div>
      <ui-button class="profile-roommates-section__add-section" centered rounded="100%" style="width: 52px; height: 52px" @click="isAddRoommatesModalShow = true">
        <ui-icon name="plus" />
      </ui-button>

      <ui-modal
        ref="addRoommateModal"
        :is-shown="isAddRoommatesModalShow"
        backdrop-filter="blur(3px)"
        transition-fade-name="fade"
        transition-content-name="translate"
        place=".layout"
        width="528px"
        @click-outside="isAddRoommatesModalShow = false"
      >
        <template #inner>
          <add-roommate-modal
            @modal-close="isAddRoommatesModalShow = false"
            @add-roommate="getRoommates()"
          />
        </template>
      </ui-modal>
    </div>
    <div v-if="invitedHousesFetch.data.value?.length" class="invited-house-section">
      <h2 class="invited-house-section__header">
        Дома, в которые меня пригласили
      </h2>
      <div class="invited-house-section__container">
        <invited-house
          v-for="house in invitedHousesFetch.data.value"
          :id="house.id"
          :key="house.id"
          :name="house?.name"
          :inviter="house.inviter"
          :code="house.code"
          @update-pending="getPending"
        />
      </div>
    </div>
    <ui-button
      v-if="isHouseOwner?.id||!groupStore.upGroups?.length"
      rounded="16px"
      class="profile__sync-device"
      @click="aliceSync()"
    >
      Синхронизировать с Алисой
    </ui-button>
    <ui-button
      v-if="!isHouseOwner"
      class="profile__leave-from-house-button"
      class-name="delete"
      rounded="16px"
      @click="leaveFromHouse"
    >
      Покинуть дом
    </ui-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/store/user'
import { useGroupsStore } from "~/store/groups"
import { useDevicesStore } from "~/store/devices"
import UiModal from "~/components/ui/UiModal.vue"
import AddRoommateModal from "~/components/Profile/AddRoommateModal.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import InvitationForm from "~/components/Profile/InvitationForm.vue"
import InvitedHouse from "~/components/Profile/InvitedHouse.vue"
import apiUsersPendingGet from "~/api/usersPending/get"

const userStore = useUserStore()
const groupStore = useGroupsStore()
const devicesStore = useDevicesStore()
const { userInfo } = storeToRefs(userStore)
const isAddRoommatesModalShow = ref(false)
const addRoommateModal = ref(null)
const isHouseOwner = groupStore.upGroups.find(el => el.groupCreatorId === userInfo.value.id && el.id === groupStore.currentHome)

const invitedHousesFetch = useLazyAsyncData(
  'pending',
  () => apiUsersPendingGet())
const roommatesFetch = useLazyAsyncData(
  'groupUsers',
  () => groupStore.getUsersByGroupId(groupStore.currentHome),
)
const userFetch = useLazyAsyncData(
  'user-init',
  () => userStore.init(),
)
function aliceSync () {
  devicesStore.getConfig()
}
async function getRoommates () {
  await roommatesFetch.refresh()
}
async function getPending () {
  await invitedHousesFetch.refresh()
  await groupStore.getHouses()
}
async function leaveFromHouse () {
  const response = await groupStore.removeUsersFromGroup([groupStore.currentHome], [], [userInfo.value.id])
  if (response.length) {
    useNotification('info', response)
    const currentHomeId = groupStore.upGroups.find(el => el.groupCreatorId === userInfo.value.id)?.id || groupStore.upperGroups[0].id
    setTimeout(async () => {
      await groupStore.setCurrentHome(currentHomeId)
      await useRouter().push(`user/group/${currentHomeId}`)
    }, 1000)
  }
}

onMounted(() => {
  nextTick(async () => {
    if (userInfo.value.name?.length < 1) {
      await userFetch.execute()
    }
    if (!groupStore.group?.groupCreatorId) {
      const fallbackGroup = groupStore.upGroups.find(el => el.id === groupStore.currentHome)
      if (fallbackGroup) {
        groupStore.setCurrentGroup(fallbackGroup)
      }
    }
  })
})
</script>

<style lang="scss">
@import "assets/styles/page/_user";

</style>
