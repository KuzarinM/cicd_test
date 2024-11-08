<template>
  <div class="add-roommate-modal">
    <loader-screen :is-loading="isLoading" />
    <div class="add-roommate-modal__header">
      <div class="add-roommate-modal__header-text">
        Добавить пользователя
      </div>
      <ui-button
        class-name="blank"
        padding="0"
        margin-inline="0"
        @click="emit('modal-close')"
      >
        <ui-icon name="close" />
      </ui-button>
    </div>
    <form
      action=""
      method="post"
      class="add-roommate-modal__form"
      @submit.prevent="addRoommate()"
    >
      <div class="add-roommate-modal__input-group">
        <label for="email" class="add-roommate-modal__input-group-label">
          Email нового пользователя
        </label>
        <input
          id="email"
          v-model="login"
          type="email"
          name="email"
          class="add-roommate-modal__input-group-input"
          @keydown.enter="addToLoginsArray"
        >
        <ui-button
          class-name="default"
          rounded="100%"
          padding="8px"
          margin-inline="0"
          @click="addToLoginsArray"
        >
          <ui-icon name="plus" />
        </ui-button>
      </div>
      <div class="add-roommate-modal__users">
        <div
          v-if="logins?.length === 0"
          class="add-roommate-modal__users-user --placeholder"
        >
          Здесь будет отображен список пользователей
        </div>
        <ui-any-list-item
          v-for="user in logins"
          :key="user.userLogin"
          class="add-roommate-modal__users-user"
        >
          <template #title>
            <span>
              {{ user.userLogin }}
            </span>
          </template>
          <template #action>
            <ui-button
              class-name="blank"
              padding="0"
              margin-inline="0"
            >
              <ui-icon
                name="delete"
                color="#D15151"
                size="20"
                role="button"
                @click.prevent="removeFromLoginsArray(user.userLogin)"
              />
            </ui-button>
          </template>
        </ui-any-list-item>
      </div>
      <div v-show="logins.length" class="add-roommate-modal__input-group">
        <label for="house" class="add-roommate-modal__input-group-label">
          Выберите дом, доступный пользователю
        </label>
        <ui-select
          v-if="upperGroups"
          style="width: 100%"
          :options="selectDataHouses"
          select-name="Дом не выбран"
          :current-value="selectedHouse"
          @custom-select="(e)=>{ selectedHouse = e;getSubgroups() }"
        />
      </div>
      <div v-show="logins.length && selectDataGroups.length" class="add-roommate-modal__groups">
        <label for="groups" class="add-roommate-modal__input-group-label">
          Выберите группы, доступные пользователю
        </label>
        <div class="add-roommate-modal__groups-select-all">
          <ui-checkbox
            :initial-bg="'var(--settings-color)'"
            :checked="selectDataGroups.length === groupIds.length"
            @check="e=>selectGroups(e,'all')"
          />
          Выбрать всё
        </div>

        <ui-any-list-item
          v-for="group in selectDataGroups"
          :key="group.id"
        >
          <template #title>
            {{ group.name }}
          </template>
          <template #action>
            <ui-checkbox
              :checked="groupIds.includes(group.id)"
              @check="e=>selectGroups(e,group.id)"
            />
          </template>
        </ui-any-list-item>
      </div>
      <div v-show="logins.length && selectDataGroups.length" class="add-roommate-modal__groups">
        <label for="groups" class="add-roommate-modal__input-group-label">
          Предоставить доступ к сценариям и автоматизациям
        </label>
        <div v-show="selectDataGroups.length" class="add-roommate-modal__groups-select-all">
          <ui-checkbox
            :initial-bg="'var(--settings-color)'"
            :checked="isAllCanAutomate"
            @check="setAllUserAutomatePermission"
          />
          Выбрать всех
        </div>

        <ui-any-list-item
          v-for="user in logins"
          :key="user.userLogin"
        >
          <template #title>
            {{ user.userLogin }}
          </template>
          <template #action>
            <ui-checkbox
              :checked="user.canAutomate"
              @check="e=>user.canAutomate = e"
            />
          </template>
        </ui-any-list-item>
      </div>
      <ui-button type="submit" :disabled="logins?.length===0 || selectedHouse.length === 0" rounded="16px">
        Отправить приглашение
      </ui-button>
    </form>
  </div>
</template>

<script setup lang="ts">

import { useGroupsStore } from "~/store/groups"
import UiSelect from "~/components/ui/UiSelect.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import { useUserStore } from "~/store/user"
import type { IGroupUser } from "~/api/usersPending/create"

const emit = defineEmits(['modal-close', 'add-roommate'])
const groupStore = useGroupsStore()
const userId = useUserStore().id
const isLoading = ref(false)
const login = ref('')
const groupIds = ref<string[]>([])
const selectedHouse = ref('')
const logins = reactive<IGroupUser[]>([])
const upperGroups = groupStore.upGroups
const selectDataHouses = ref(upperGroups.reduce((acc:{ description:string, value:any }[], curr) => {
  if (curr.groupCreatorId === userId && curr.typeId === 1) {
    acc.push({ description: curr.name as string, value: curr.id })
  }
  return acc
}, []))
const selectDataGroups = ref<{id:string, name:string}[]>([])
const isAllCanAutomate = computed(() => !logins.find(el => el.canAutomate === false))
await groupStore.getAll()

function addToLoginsArray () {
  if (logins?.length > 0 && logins?.find(el => el?.userLogin?.toLowerCase() === login.value.toLowerCase())) {
    useNotification('error', 'Этот пользователь уже есть в списке')
    return false
  }
  if (login.value?.length > 0) {
    const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm
    if (!login.value.match(emailRegex)) {
      useNotification('error', 'Введите настоящий email')
      return false
    }
    logins.push({ userLogin: login.value, canAutomate: false })
    login.value = ''
  }
}
function removeFromLoginsArray (login:string) {
  if (logins?.length) {
    const idx = logins.findIndex(el => el.userLogin?.toLowerCase() === login.toLowerCase())
    logins.splice(idx, 1)
  }
}

async function getSubgroups () {
  selectDataGroups.value = await groupStore.getSubgroups(selectedHouse.value)
}
function setAllUserAutomatePermission () {
  const canAutomate = unref(isAllCanAutomate.value)
  logins.map(el => el.canAutomate = !canAutomate)
}
function selectGroups (e:boolean, id:string) {
  if (id === 'all') {
    if (groupIds.value.length < selectDataGroups.value.length) {
      groupIds.value = [...selectDataGroups.value.map(el => el.id)]
      return
    }
    groupIds.value = []
  }
  if (e) {
    groupIds.value.push(id)
    return
  }
  groupIds.value = groupIds.value.filter(el => el !== id)
}
async function addRoommate () {
  if (groupIds.value?.length === 0 && selectedHouse.value?.length === 0) {
    useNotification('error', 'Выберите группу')
    return
  }
  isLoading.value = true
  await groupStore.addUserToGroup({ userPendingAutomationPermission: logins, groupsIds: [selectedHouse.value, ...groupIds.value] })
  isLoading.value = false
  emit('add-roommate')
}

</script>

<style lang="scss">
@import "assets/styles/components/profile-add-roommate-modal";

</style>
