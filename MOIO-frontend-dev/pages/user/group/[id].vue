<template>
  <div class="group">
    <loader-screen :is-loading="isLoading" />
    <group-list
      v-if="group?.name"
      :id="groupId"
      :is-group-page="true"
      :name="group?.name"
      :devices="group?.devices"
      :inverse-parent="group?.inverseParent"
      :hide-empty="true"
      :type-id="group?.typeId"
      :can-edit="canEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"

const groupStore = useGroupsStore()
const { group, canEdit } = storeToRefs(groupStore)
const route = useRouter()
const groupId = route.currentRoute.value.params.id as string
const fetchGroup = useLazyAsyncData(
  `groupById-${groupId}`,
  () => groupStore.getGroupById(groupId),
)
const isLoading = computed(() => fetchGroup.pending.value)

if (groupStore.currentHome !== groupId && groupStore.upGroups?.find(el => el.id === groupId)?.typeId === 1) {
  groupStore.setCurrentHome(groupId)
  useNotification('info', 'Просматриваемый дом изменен')
}

</script>

<style lang="scss">
@import "assets/styles/page/user-group";
</style>
