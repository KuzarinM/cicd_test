<template>
  <div class="add-group --edit">
    <loader-screen :is-loading="isLoading" />
    <div class="add-group">
      <h1 class="add-group__header">
        Изменить этаж
      </h1>
      <form method="post" class="add-group__form" @submit.prevent="editGroup()">
        <div class="add-group__input-group">
          <label for="group" class="add-group__label">Введите название этажа</label>
          <input id="group" v-model="name" type="text" name="group" class="add-group__input" required placeholder="Название этажа">
        </div>
        <div v-if="house?.length>1" class="add-group-available-devices">
          <h2 class="add-group-available-devices__header">
            {{ existingDevices?.length?
              'Доступные устройства':
              'Устройства уже распределены по группам или не найдены'
            }}
          </h2>
          <div v-if="existingDevices?.length>0" class="add-group-available-devices__list">
            <ui-any-list-item
              v-for="device in existingDevices"
              :key="device.id"
            >
              <template #title>
                {{ device?.name }}
              </template>
              <template #action>
                <ui-checkbox
                  :checked="devices.findIndex(el=>el.id === device.id)>-1"
                  @check="(e)=>useSetItemOnCheckbox(e,devices,{id:device.id,name:device.name})"
                />
              </template>
            </ui-any-list-item>
          </div>
        </div>
        <div class="add-group__preview-wrapper">
          <div v-if="previewData.name?.length" class="add-group__preview">
            <div class="add-group__preview-section">
              <div class="add-group__preview-section-title">
                Название этажа
              </div>
              <div class="add-group__preview-section-value">
                {{ previewData.name }}
              </div>
            </div>
            <div class="add-group__preview-section">
              <div class="add-group__preview-section-title">
                Гости этажа
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
                        usersForRemove.push({id:user.id,name:user.name})
                        users = users.filter(el=>el.id !== user.id)}"
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
            <div class="add-group__preview-section">
              <div class="add-group__preview-section-title">
                Устройства этажа
              </div>
              <div v-if="previewData.devices?.length" class="add-group__preview-section-value">
                <ui-any-list-item v-for="item in previewData.devices" :key="item.id">
                  <template #title>
                    {{ item?.name }}
                  </template>
                  <template #action>
                    <ui-button
                      class-name="blank"
                      padding="0"
                      @click="(e)=>{useSetItemOnCheckbox(false,devices,{id:item.id,name:item.name})
                                    useSetItemOnCheckbox(true,existingDevices,{id:item.id,name:item.name})
                      }"
                    >
                      <ui-icon
                        name="delete"
                        color="#D15151"
                        size="20"
                      />
                    </ui-button>
                  </template>
                </ui-any-list-item>
              </div>
              <div v-else class="add-group__preview-section-value">
                Нет выбранных устройств
              </div>
            </div>
          </div>
        </div>
        <div class="add-group__submit-wrapper">
          <ui-button class-name="default" margin-inline="0" type="submit" rounded="16px">
            Сохранить
          </ui-button>
          <form method="post" @submit.prevent="deleteGroup()">
            <ui-button class-name="delete" margin-inline="0" type="submit" rounded="16px">
              Удалить
            </ui-button>
          </form>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import UiButton from "~/components/ui/UiButton.vue"
import UiAnyListItem from "~/components/ui/UiAnyListItem.vue"
import useDataForGroupEdit from "~/composables/useDataForGroupEdit"
import useEditGroup from "~/composables/useEditGroup"

const id = useRoute().params.id as string

const editFetch = await useAsyncData(
    `editGp-${id}`,
    () => useEditGroup(id, name.value, oldName, usersForRemove.value, existingDevices.value, devices.value),
    { immediate: false },
)
const groupFetch = useLazyAsyncData(
  `groupById-${id}`,
  () => useDataForGroupEdit(id),
  { immediate: false },
)
const deleteFetch = await useAsyncData(
  `deleteGp-${id}`,
  () => groupStore.deleteGroup(id),
  { immediate: false },
)

let oldName = ''
const groupStore = useGroupsStore()
const { currentHome } = storeToRefs(groupStore)
const name = ref('')
const house = ref(currentHome)
const devices = ref<{ id: string, name:string }[]>([])
const existingDevices = ref<{id:string, name:string}[]>([])
const users = ref<{id:number, name:string}[]>([])
const usersForRemove = ref<{id:number, name:string}[]>([])
const rooms = ref<{ id: string, name:string }[]>([])
const previewData = ref({
  name,
  devices,
  rooms,
  users,
})

const isLoading = computed(() =>
  (deleteFetch.pending.value && deleteFetch.status.value !== 'idle') ||
    (editFetch.pending.value && editFetch.status.value !== 'idle') ||
    (groupFetch.pending.value))

async function mapGroupData () {
  await groupFetch.execute()
  const data = groupFetch.data.value
  if (data) {
    const { inGroupDevices, inHouseDevices, groupName, inGroupUsers, groupHouse } = data
    name.value = groupName
    oldName = groupName
    devices.value = inGroupDevices
    existingDevices.value = inHouseDevices
    users.value = inGroupUsers
    house.value = groupHouse
  }
}
mapGroupData()
async function editGroup () {
  await editFetch.execute()
  if (editFetch.status.value === 'success') {
    useNotification('info', 'Изменения успешно сохранены')
    setTimeout(() => {
      useRouter().push({ path: '/user/group/' + id })
    }, 900)
  }
}
async function deleteGroup () {
  await deleteFetch.execute()
}


</script>
<style lang="scss">
@import "assets/styles/page/user-add-room";
@import "assets/styles/page/_user";

</style>
