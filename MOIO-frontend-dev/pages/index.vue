<template>
  <div class="group">
    <loader-screen :is-loading="isLoading" />
    <group-list
      v-if="group?.name"
      :id="groupStore.currentHome"
      :name="group?.name"
      :devices="group.devices"
      :inverse-parent="group?.inverseParent"
      :hide-empty="true"
      :type-id="1"
      :can-edit="canEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"

import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"

const groupStore = useGroupsStore()
const { group, canEdit, home } = storeToRefs(groupStore)
const groupsFetch = useLazyAsyncData('allGroups',
  () => groupStore.getAll())
const groupFetch = useLazyAsyncData(`groupById-${home.value}`,
  () => groupStore.getGroupById(home.value))

const isLoading = computed(() => (groupsFetch.pending.value) || (groupFetch.pending.value))
</script>

<style lang="scss">
@import "assets/styles/page/user-group";
</style>
