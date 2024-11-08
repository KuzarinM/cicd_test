<template>
  <div class="group">
    <h1 class="group-header">
      {{ group.name }}
    </h1>
    <template v-if="isHouseOwner && roommatesFetch.data.value?.length && groupId === currentHome">
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
    <loader-screen :is-loading="isLoading" />
    <group-list
      v-if="group?.name"
      :id="groupId"
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
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import AddRoommateModal from "~/components/Profile/AddRoommateModal.vue"
import { useUserStore } from "~/store/user"

const userStore = useUserStore()
const groupStore = useGroupsStore()
const { userInfo } = storeToRefs(userStore)
const { group, canEdit, currentHome } = storeToRefs(groupStore)
const route = useRouter()
const groupId = route.currentRoute.value.params.id as string
const isHouseOwner = groupStore.upGroups.find(el => el.groupCreatorId === userInfo.value.id && el.id === groupStore.currentHome)
const fetchGroup = useLazyAsyncData(
  `groupById-${groupId}`,
  () => groupStore.getGroupById(groupId),
)
const roommatesFetch = useLazyAsyncData(
  'groupUsers',
  () => groupStore.getUsersByGroupId(groupStore.currentHome),
)
async function getRoommates () {
  await roommatesFetch.refresh()
}
const isLoading = computed(() => fetchGroup.pending.value)

if (groupStore.currentHome !== groupId && groupStore.upGroups?.find(el => el.id === groupId)?.typeId === groupStore.getGroupTypeId('House')) {
  groupStore.setCurrentHome(groupId)
  useNotification('info', 'Просматриваемый дом изменен')
}

</script>

<style lang="scss">
@import "assets/styles/page/user-group";
</style>
