<template>
  <loader-screen
    :is-loading="
      invitedHousesFetch.pending.value||
      userFetch.pending.value ||
      isLoading  
    "
  />
  <div class="profile" v-show="!isLoading">
    <h1 class="profile-head">
      Профиль
    </h1>
    <profile-card
      :role="userInfo.role"
      :displayed-name="userInfo.name"
      :avatar-url="userInfo.avatarUrl"
      :client-id="userInfo.clientId"
      :login="userInfo.login"
    />
    <invitation-form />
    <div v-if="invitedHousesFetch.data.value?.length" class="invited-house-section">
      <h2 class="invited-house-section__header">
        Приглашения
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
    <setting-group class="profile__settings"/>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/store/user'
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import InvitationForm from "~/components/Profile/InvitationForm.vue"
import InvitedHouse from "~/components/Profile/InvitedHouse.vue"
import SettingGroup from '~/components/SettingGroup/SettingGroup.vue'
import apiUsersPendingGet from "~/api/usersPending/get"

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const isLoading = ref(false)

const invitedHousesFetch = useLazyAsyncData(
  'pending',
  () => apiUsersPendingGet())
const userFetch = useLazyAsyncData(
  'user-init',
  () => userStore.init(),
)
async function getPending () {
  await invitedHousesFetch.refresh()
}

onMounted(() => {
  nextTick(async () => {
    if (userInfo.value.name?.length < 1) {
      await userFetch.execute()
    }
  })
})

onBeforeRouteLeave(() => isLoading.value = true)
</script>

<style lang="scss">
@import "assets/styles/page/_user";

</style>
