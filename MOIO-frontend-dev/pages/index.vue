<template>
  <div class="group">
    <loader-screen :is-loading="isLoading" />
    <h1 class="group-header">
      {{ group?.name }}
    </h1>
    <template v-if="isHouseOwner && roommatesFetch.data.value?.length">
      <h1 class="profile-roommates-section__header">
        Гости
      </h1>
      <div class="profile-roommates-section">
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
      </div>
    </template>
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
    <smart-meter
      v-if="meters.length"
      :meters="meters"
    />
    <group-list
      v-if="group?.name"
      :id="groupStore.currentHome"
      :is-group-page="true"
      :is-main-page="true"
      :name="group?.name"
      :devices="group?.devices"
      :is-automation="false"
      :inverse-parent="group?.inverseParent"
      :hide-empty="true"
      :type-id="group?.typeId"
      :can-edit="canEdit"
      :is-from-home="group?.typeId === groupStore.getGroupTypeId('House')"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AddRoommateModal from "~/components/Profile/AddRoommateModal.vue"
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import { useUserStore } from "~/store/user"

const userStore = useUserStore()
const groupStore = useGroupsStore()
const { userInfo } = storeToRefs(userStore)
const empty = ref(false)
const addRoommateModal = ref(null)
const isHouseOwner = groupStore.upGroups.find(el => el.groupCreatorId === userInfo.value.id && el.id === groupStore.currentHome)

const roommatesFetch = useLazyAsyncData(
  'groupUsers',
  () => groupStore.getUsersByGroupId(groupStore.currentHome),
)
async function getRoommates () {
  await roommatesFetch.refresh()
}
const { group, canEdit, home } = storeToRefs(groupStore)
if (group.value.devices) {
  empty.value = true
}
const groupsFetch = useLazyAsyncData('allGroups',
  () => groupStore.getAll())
const groupFetch = useLazyAsyncData(`groupById-${home.value}`,
  () => groupStore.getGroupById(home.value))

const isLoading = computed(() => (groupsFetch.pending.value) || (groupFetch.pending.value))

const meters = useFilteredByRoleDeviceFromGroup(await groupStore.getGroupById(groupStore.currentHome), 'meter')
</script>

<style lang="scss">
.device-header{
  margin-top: 20px;
  color: #fff;
}
@import "assets/styles/page/user-group";
@import "assets/styles/components/_profile-roommate";
@import "assets/styles/page/_user"
</style>
