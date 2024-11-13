<template>
  <div class="layout-bg">
    <div class="layout --default">
      <header ref="header" class="header">
        <the-header />
      </header>
      <aside ref="aside">
        <the-aside />
      </aside>
      <main
        ref="main"
        :class="`
        ${hours >= 6 && hours <= 11 ? '--morning' : ''}
        ${hours > 11 && hours <= 16 ? '--day' : ''}
        ${hours > 16 && hours <= 20 ? '--evening' : ''}
        ${hours > 20 ? '--night' : ''}
        ${hours >= 0 && hours < 6 ? '--night' : ''}
        ${useRouter().currentRoute.value.fullPath === '/user' ? '--primary' : ''}
        `"
      >
        <div class="dark-opacity">
          <div class="scrollable-content">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import TheAside from '~/components/Aside/TheAside.vue'
import TheHeader from '~/components/Header/TheHeader.vue'
import { useUserStore } from "~/store/user"
import { useGroupsStore } from "~/store/groups"
import type { ServiceProps } from "~/components/Service/TheService.vue"
import { useCategoriesStore } from "~/store/categories"
import { useDevicesStore } from '~/store/devices'
import type { IGroupResponseItem } from '~/api/group/getAll'
import type { IAllDevicesResponse } from '~/api/device/getAll'

const userStore = useUserStore()
const groupStore = useGroupsStore()
const categoriesStore = useCategoriesStore()
const deviceStore = useDevicesStore()
const { currentRoute } = useRouter()
await userStore.init()
await groupStore.getHouses()
await deviceStore.getColor()
const main = ref()
const header = ref()
const aside = ref()
const hours = new Date().getHours()

// Сокеты
const { $bus } = useNuxtApp()
const restBaseUrl = useRuntimeConfig().public.REST_BASE_TARGET
const socket = await useSocket(restBaseUrl + "/chat")
let isChanged = false

export interface UpdateDeviceStateMessage {
  deviceId: string
  deviceName: string
}

async function refreshData () {
  if (Number.isInteger(categoriesStore.currentCategory?.id) && Number(categoriesStore.currentCategory?.id) > -1) {
    return await categoriesStore.getDevicesByCategoryId(Number(categoriesStore.currentCategory?.id), groupStore.currentHome)
  }
  if (groupStore.group && groupStore.group.id) {
    return await groupStore.getGroupById(groupStore.group.id)
  }
}

// Принятие сообщения об изменении состоянии датчика (не девайс)
socket.connection.on("UpdateSensorState", (message: string) => {
  useNotification("info", message)
  refreshData()
})

// Принятие сообщения об изменении состоянии устройства (не включает датчики)
socket.connection.on("UpdateDeviceState", (message: UpdateDeviceStateMessage) => {
  isChanged = false
  changeCapability(message)
  $bus.emit('device-update-emit', message)
})

socket.connection.on("UpdateConfig", (message: ServiceProps) => {
  useNotification("info", `Обновлено состояние устройства ${message.name}`)
  refreshData()
})

// Обновление Capability устройств
async function changeCapability (message: UpdateDeviceStateMessage, group = groupStore.group) {
  // Запрос к сервису девайсов по его Id
  const device = await deviceStore.getById(message.deviceId)

  // Проходимся по всем категория и присваиваем им новые значения категорий уже с измененными в девайсах capability
  for (const categoryId of Object.keys(categoriesStore.devicesInCategory)) {
    categoriesStore.devicesInCategory[categoryId].forEach((d) => { d.capabilities = [...device.capabilities] })
  }

  // Прописываем для всех найденных в группе и дочерних группах новые capability у девайсов
  getDevices(device.id, group).forEach((d) => { d.capabilities = [...device.capabilities] })
}

// Получение девайса по его Id в переданной группе и ее подгруппах
function getDevices (deviceId: string, group: IGroupResponseItem) {
  let devices: IAllDevicesResponse[] = []
  devices = devices.concat(group.devices.filter(d => d.id === deviceId))

  if (group.inverseParent?.length) {
    group.inverseParent.forEach((group) => {
      devices = devices.concat(getDevices(deviceId, group))
    })
  }

  return devices
}

watch(currentRoute, () => {
  aside.value.style.top = '0px'
})

</script>
<style lang="scss">
.--morning{
  background: linear-gradient(180deg, #6A9AC7 0%, #9AAAD5 45.25%, #E8ADB3 100%);
}
.--day{
  background: linear-gradient(180deg, #8DA8C5 0%, #AFC1CF 22.12%, #CCCECB 45.43%, #DBCBB9 62.15%, #DCC2A8 75.63%, #D3AF97 93.03%, #C29E8F 100%);
}
.--evening{
  background: linear-gradient(180deg, #8CA3B3 0%, #A9B8BF 14.32%, #ACBABF 18.32%, #C4C5BF 32.96%, #E4CEAF 50.16%, #FAD29D 65.51%, #FDCF81 77.91%, #FEBA41 90.63%, #FEA73D 99.85%);
}
.--night{
  background: linear-gradient(126.07deg, #27336F -2.29%, #7968AE 45.16%, #D493B5 94.44%);
}
.--primary{
  background: $bg-primary;
}
@import "assets/styles/layouts/default-layout";
</style>
