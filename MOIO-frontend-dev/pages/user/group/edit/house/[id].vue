<template>
  <div class="add-group --edit">
    <loader-screen :is-loading="isLoading" />
    <div class="add-group">
      <h1 class="add-group__header">
        Изменить дом
      </h1>
      <form method="post" class="add-group__form" @submit.prevent="editGroup()">
        <div class="add-group__input-group">
          <label for="group" class="add-group__label">Введите название дома</label>
          <input
            id="group"
            v-model="name"
            type="text"
            name="group"
            class="add-group__input"
            placeholder="Название дома"
            required
          >
        </div>
        <div v-if="house?.length>1" class="add-group-available-devices">
          <div class="add-group__preview-wrapper">
            <div v-if="previewData.name?.length" class="add-group__preview">
              <div class="add-group__preview-section">
                <div class="add-group__preview-section-title">
                  Название дома
                </div>
                <div class="add-group__preview-section-value">
                  {{ previewData.name }}
                </div>
              </div>
              <div class="add-group__preview-section">
                <div class="add-group__preview-section-title">
                  Гости дома
                </div>
                <div v-if="previewData.users?.length" class="add-group__preview-section-value">
                  <ui-any-list-item v-for="user in previewData.users" :key="user.id">
                    <template #title>
                      {{ user?.name }}
                    </template>
                    <template #action>
                      <ui-button
                        class-name="blank"
                        padding="0"
                        @click="(e)=>{
                          usersForRemove.push({id:user.id,name:user.name});
                          users.splice(users.findIndex(el=>el.id === user.id),1)
                        }"
                      >
                        <ui-icon
                          v-if="user.id !== groupStore.group.groupCreatorId"
                          name="delete"
                          color="#D15151"
                          size="20"
                        />
                      </ui-button>
                    </template>
                  </ui-any-list-item>
                </div>
                <div v-else class="add-group__preview-section-value">
                  Нет приглашенных пользователей
                </div>
              </div>
            </div>
          </div>
          <div class="add-group__submit-wrapper">
            <ui-button type="submit" margin-inline="0" rounded="16px">
              Сохранить
            </ui-button>
            <form method="post" @submit.prevent="deleteGroup()">
              <ui-button type="submit" margin-inline="0" rounded="16px" class-name="delete">
                Удалить
              </ui-button>
            </form>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import useDataForGroupEdit from "~/composables/useDataForGroupEdit"
import useEditGroup from "~/composables/useEditGroup"

let oldName = ''
const isLoading = ref(false)
const id = useRoute().params.id as string
const name = ref('')
const house = ref("")
const users = ref<{id:number, name:string}[]>([])
const usersForRemove = ref<{id:number, name:string}[]>([])
const groupStore = useGroupsStore()
const previewData = ref({
  name,
  users,
})

async function getGroupData () {
  isLoading.value = true
  const { groupName, inGroupUsers } = await useDataForGroupEdit(id)
  isLoading.value = false
  users.value = inGroupUsers
  house.value = id
  name.value = groupName
  oldName = groupName
}
getGroupData()

async function editGroup () {
  isLoading.value = true
  const isSuccess = await useEditGroup(id, name.value, oldName, usersForRemove.value)
  await groupStore.getHouses()
  isLoading.value = false
  if (isSuccess) {
    setTimeout(() => {
      useRouter().push({ path: '/user/group/' + id })
    }, 900)
  }
}
async function deleteGroup () {
  await groupStore.deleteGroup(id)
}


</script>
<style lang="scss">
@import "assets/styles/page/user-add-room";
</style>
