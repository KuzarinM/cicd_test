<template>
  <div class="invited-house">
    <div class="invited-house__info">
      <div class="invited-house__info-house-name">
        {{ name }}
      </div>
      <div class="invited-house__info-owner-name">
        {{ inviter }}
      </div>
    </div>
    <div class="invited-house__actions" style="display:flex; gap: 16px;">
      <ui-button
        class="invited-house__actions-action"
        class-name="default"
        rounded="16px"
        margin-inline="0"
        @click="acceptInvite()"
      >
        Принять
      </ui-button>
      <ui-button
        class="invited-house__actions-action"
        class-name="delete"
        fill="var(--settings-color)"
        rounded="16px"
        margin-inline="0"
        @click="rejectInvite"
      >
        Отклонить
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import apiGroupRejectPending from "~/api/group/removePending"

export interface IInvitedHouse {
    id:string,
    name:string,
    inviter:string
    code:string
}
const props = defineProps<IInvitedHouse>()
const emit = defineEmits<{
    updatePending:[void]
}>()
const groupStore = useGroupsStore()
async function acceptInvite () {
  await groupStore.checkCode(props.code)
  emit('updatePending')
}

async function rejectInvite () {
  await apiGroupRejectPending(props.code)
  emit('updatePending')
}
</script>

<style lang="scss">
@import "assets/styles/components/invited-house";
</style>
