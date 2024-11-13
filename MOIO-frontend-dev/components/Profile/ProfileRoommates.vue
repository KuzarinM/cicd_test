<template>
  <div class="roommates-card" @click="isSettingsModalShow = true">
    <div class="roommates-card__avatar">
      <div class="roommates-card__avatar --blank" />
    </div>
    <div class="roommates-card-info">
      <div :class="`roommates-card-info__is-pending`">
        {{ isPending ? 'Ожидание ответа на приглашение' : name }}
      </div>
      <div class="roommates-card-info__name">
        {{ login }}
      </div>
      <div class="roommates-card-info__role">
        <div v-if="groups.length">
          <span v-for="group in groups" :key="group.id" data-end=", ">{{ group.name }}</span>
        </div>
        <span v-else>
          Доступ к дому без вложенных групп
        </span>
      </div>
    </div>
    <ui-icon v-if="isChange" style="z-index: 5; color: rgb(180, 0, 0); margin-left: 5px;" name="delete" @click="emit('userForRemove')" />
  </div>
  <ui-modal
    ref="settings"
    :is-shown="isSettingsModalShow"
    backdrop-filter="blur(3px)"
    transition-content-name="translate"
    width="532px"
    @click-outside="closeModal"
  >
    <template #inner>
      <roommate-settings
        :avatar-url="''"
        :groups="groups"
        :email="login"
        @modal-close="closeModal"
        @remove-user="emit('removeUser')"
      />
    </template>
  </ui-modal>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon.vue"
import UiModal from "~/components/ui/UiModal.vue"
import RoommateSettings from "~/components/Profile/RoommateSettings.vue"
import { useGroupsStore } from "~/store/groups"

export type ProfileRoommates = {
  isEdit?:boolean
  id:number
  name:string
  login:string,
  groups:{id:string, name:string, isPending:boolean}[]
  isPending:boolean
  isChange?:boolean
}

const props = defineProps<ProfileRoommates>()
const emit = defineEmits<{
    removeUser:[void]
    userForRemove:[void]
}>()

const groupStore = useGroupsStore()
const isSettingsModalShow = ref(false)
async function removeUserFromGroup (isHome?:boolean) {
  const groups = isHome ? [groupStore.currentHome] : props.groups.map(el => el.id)
  await groupStore.removeUsersFromGroup(groups, [], [props.id])
  emit('removeUser')
}
function closeModal (e:Event) {
  if (isSettingsModalShow.value) {
    e.stopPropagation()
    isSettingsModalShow.value = false
  }
}

</script>

<style lang="scss">
@import "assets/styles/components/profile-roommate";
</style>
