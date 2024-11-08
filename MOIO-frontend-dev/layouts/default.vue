<template>
  <keep-alive>
    <div class="layout --default">
      <header ref="header" class="header">
        <the-header />
      </header>
      <aside ref="aside">
        <the-aside />
      </aside>
      <main ref="main">
        <slot />
      </main>
    </div>
  </keep-alive>
</template>
<script setup lang="ts">
import TheAside from '~/components/Aside/TheAside.vue'
import TheHeader from '~/components/Header/TheHeader.vue'
import { useUserStore } from "~/store/user"
import { useGroupsStore } from "~/store/groups"
import type { ServiceProps } from "~/components/Service/TheService.vue"
import { useCategoriesStore } from "~/store/categories"
import useTransformOnScroll from "~/composables/useTransformOnScroll"

const userStore = useUserStore()
const groupStore = useGroupsStore()
const categoriesStore = useCategoriesStore()
const { currentRoute } = useRouter()
await userStore.init()
await groupStore.getHouses()
const main = ref()
const header = ref()
const aside = ref()

// Сокеты
const { $bus } = useNuxtApp()
const restBaseUrl = useRuntimeConfig().public.REST_BASE_TARGET
const socket = await useSocket(restBaseUrl + "/chat")
let isChanged = false

useTransformOnScroll(main, [header, aside], '0px', '-124px', 'top')

socket.connection.on("UpdateSensorState", (message:string) => {
  // console.log("UpdateSensorState", message)
  useNotification("info", message)
})
socket.connection.on("UpdateDeviceState", (message:ServiceProps) => {
  // console.log("UpdateDeviceState", message)
  // const isCapabilityModalShown = document.querySelector('.service-capabilities-list-wrapper .modal.--shown')
  // if (!isCapabilityModalShown) {
  //   TODO пересмотреть поведение получения девайса, который настраивается
  isChanged = false
  changeCapability(message)
  $bus.emit('device-update-emit', message)
  // }
})
socket.connection.on("UpdateConfig", (message:ServiceProps) => {
  // console.log("UpdateConfig", message)
  useNotification("info", `Обновлено состояние устройства ${message.name}`)
})

function changeCapability (message:ServiceProps, group = groupStore.group) {
  // console.log('hiiiiiiiiiiiiiiiiiiiii')
  const isCategory = currentRoute.value.fullPath.includes('category/')
  if (isCategory && !isChanged) {
    for (const category of Object.keys(categoriesStore.devicesInCategory)) {
      const deviceIdx = categoriesStore.devicesInCategory[category].findIndex(el => el.id === message.id)
      if (deviceIdx > -1) {
        categoriesStore.devicesInCategory[category][deviceIdx].capabilities = [...message.capabilities]
        isChanged = true
      }
    }
    return
  }
  if (group.id === message.groupId) {
    const deviceIdx = group.devices.findIndex(el => el.id === message.id)
    if (message.capabilities?.length) {
      group.devices[deviceIdx].capabilities = [...message.capabilities]
    }
    isChanged = true
    return
  }
  if (group.inverseParent?.length && !isChanged) {
    for (let i = 0; i < group.inverseParent.length; i++) {
      changeCapability(message, group.inverseParent[i])
    }
  }
}
watch(currentRoute, () => {
  aside.value.style.top = '0px'
})
</script>
<style lang="scss">
@import "assets/styles/layouts/default-layout";
</style>
