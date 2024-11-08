<template>
  <div class="roommate-settings">
    <loader-screen :is-loading="isLoading" />
    <div class="roommate-settings__header">
      <h1 class="roommate-settings__header-text">
        Настройки пользователя
      </h1>
      <ui-button class-name="blank" padding="0" margin-inline="0" @click="(e:PointerEvent)=>emit('modalClose',e)">
        <ui-icon name="close" size="24" />
      </ui-button>
    </div>
    <div class="roommate-settings__user-info">
      <img v-if="avatarUrl?.length" :alt="`Аватар пользователя ${email}`" class="profile-card__avatar" :src="avatarUrl" width="136" height="136">
      <div v-else class="profile-card__avatar --blank" />
      <div class="roommate-settings__user-info-name">
        {{ email }}
      </div>
    </div>
    <div class="roommate-settings__groups">
      <h2 class="roommate-settings__groups-header">
        Доступы
      </h2>

      <div v-if="existingGroups?.length" class="roommate-settings__groups-container">
        <ui-any-list-item v-for="group in existingGroups" :key="group.id">
          <template #title>
            <span>
              {{ group.name }}
            </span>
          </template>
          <template #action>
            <div class="roommate-settings__groups-container-remove-item">
              {{ group.isPending?'Ожидание ответа':'Есть доступ' }}
              <ui-button
                padding="0"
                class-name="blank"
                margin-inline="0"
                @click="prepareGroupsForRemove(group.id)"
              >
                <ui-icon name="delete" size="20" color="#D15151" />
              </ui-button>
            </div>
          </template>
        </ui-any-list-item>
      </div>
      <div v-else class="roommate-settings__groups-container --empty">
        У пользователя нет доступа к группам этого дома
      </div>
    </div>
    <ui-button
      class="roommate-settings__submit"
      rounded="16px"
      padding="4px 14px"
      @click="(e:PointerEvent)=>removeUserFromGroups(e)"
    >
      Сохранить
    </ui-button>
  </div>
</template>

<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import UiIcon from "~/components/ui/UiIcon.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"

export interface IRoommateSettingsProps {
  avatarUrl?:string,
  email:string
  groups:{
    id:string,
    name:string
    isPending:boolean,
  }[]
}

const props = defineProps<IRoommateSettingsProps>()
// ['modal-close', 'remove-user']
const emit = defineEmits<{
    modalClose:[PointerEvent]
    removeUser:[void]
}>()
const groupStore = useGroupsStore()
const existingGroups = ref<IRoommateSettingsProps["groups"]>(props.groups)
const groupsForRemove = ref<string[]>([])
const isLoading = ref(false)

function prepareGroupsForRemove (id:string) {
  groupsForRemove.value.push(id)
  existingGroups.value = existingGroups.value.filter(el => el.id !== id)
}
async function removeUserFromGroups (e:PointerEvent) {
  if (props.email.length && groupsForRemove.value.length) {
    isLoading.value = true
    await groupStore.removeUsersFromGroup(groupsForRemove.value, [props.email], [])
    emit('removeUser')
    isLoading.value = false
  }
  emit('modalClose', e)
}
</script>

<style lang="scss">
@import "assets/styles/components/rommate-settings";
</style>
