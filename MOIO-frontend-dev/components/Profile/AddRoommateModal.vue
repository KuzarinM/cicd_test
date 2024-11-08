<template>
  <div class="add-roommate-modal">
    <loader-screen :is-loading="isLoading" />
    <div class="add-roommate-modal__header">
      <div class="add-roommate-modal__header-text">
        Добавить гостя
      </div>
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
      </div>
      <div v-show="login.length" class="add-roommate-modal__input-group">
        <label for="house" class="add-roommate-modal__input-group-label">
          Выберите дом, доступный пользователю
        </label>
        <ui-select
          v-if="upperGroups"
          style="width: 100%"
          :options="selectDataHouses"
          select-name="Дом не выбран"
          :current-value="selectedHouse"
          @custom-select="(e)=>{ selectedHouse = e;e.length?getSubgroups():selectDataGroups=[] }"
        />
      </div>
      <div v-show="login.length && selectDataGroups.length" class="add-roommate-modal__groups">
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
      <div v-show="login.length && selectDataGroups.length" class="add-roommate-modal__groups">
        <div v-show="selectDataGroups.length" class="add-roommate-modal__groups-select-all">
          <ui-checkbox
            :initial-bg="'var(--settings-color)'"
            :checked="isAllCanAutomate"
            @check="setAllUserAutomatePermission"
          />
          Предоставить доступ к сценариям и автоматизациям
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
              @check="e=>{user.canAutomate = e}"
            />
          </template>
        </ui-any-list-item>
      </div>
      <ui-button variant="primary" type="submit" :disabled="login?.length===0 || selectedHouse.length === 0">
        Отправить приглашение
      </ui-button>
    </form>
  </div>
</template>

<script setup lang="ts">

import { useGroupsStore } from "~/store/groups"
import UiSelect from "~/components/ui/UiSelect.vue"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import { useUserStore } from "~/store/user"
import type { IGroupUser } from "~/api/usersPending/create"
import type { IGroupResponseItem } from "~/api/group/getAll"

const emit = defineEmits(['modal-close', 'add-roommate', 'refreshData'])
const groupStore = useGroupsStore()
const userId = useUserStore().id
const isLoading = ref(false)
const login = ref('')
const groupIds = ref<string[]>([])
const selectedHouse = ref('')
const logins = reactive<IGroupUser[]>([])
const { upperGroups } = storeToRefs(groupStore)
const selectDataHouses = computed(() => {
  return upperGroups.value.reduce((acc:{ description:string, value:any }[], curr: IGroupResponseItem) => {
    if (curr.groupCreatorId === userId && curr.typeId === groupStore.getGroupTypeId('House')) {
      acc.push({ description: curr.name as string, value: curr.id })
    }
    return acc
  }, [])
})
const selectDataGroups = ref<{id:string, name:string}[]>([])
const isAllCanAutomate = computed(() => !logins.find(el => el.canAutomate === false))
const canAutomate = ref(isAllCanAutomate.value)
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
  canAutomate.value = !canAutomate.value
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
  await groupStore.addUserToGroup({ userPendingAutomationPermission: [{ userLogin: login.value, canAutomate: canAutomate.value }], groupsIds: [selectedHouse.value, ...groupIds.value] })
  isLoading.value = false
  emit('add-roommate')
  login.value = ''
  emit('refreshData')
}

</script>

<style lang="scss">
@import "assets/styles/components/profile-add-roommate-modal";

</style>
