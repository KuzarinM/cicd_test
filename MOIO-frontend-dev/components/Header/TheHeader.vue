<template>
  <div class="header-content">
    <div class="header-content__flex">
      <div class="header-content__menu-container">
        <ui-button
          v-if="canAutomate"
          @click="isAddMenuShow = !isAddMenuShow"
        >
          <ui-icon name="plus" size="36" color="#e5e5e5" />
        </ui-button>
        <transition name="fade">
          <header-menu
            v-show="isAddMenuShow"
            ref="addMenu"
            :items="canEdit ? [...addMenuItems, ...ownerAddMenuItems] : [...addMenuItems]"
            @click="isAddMenuShow=false"
          />
        </transition>
      </div>
      <div class="header-content__menu-container">
        <ui-button
          ref="settingsMenuTrigger"
          @click="isSettingsMenuShow = !isSettingsMenuShow"
        >
          <ui-icon name="header/dots-horizontal" size="40" color="#e5e5e5" />
        </ui-button>
        <transition name="fade">
          <header-menu
            v-show="isSettingsMenuShow"
            ref="settingsMenu"
            :items="menuItems"
            @click="isSettingsMenuShow=false"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import UiIcon from "~/components/ui/UiIcon.vue"

const groupsStore = useGroupsStore()
const { houses, canEdit, canAutomate } = storeToRefs(groupsStore)
const route = useRoute()
const addMenuItems = [
  {
    name: "Добавить автоматизацию",
    url: '/automation/create',
  },
  {
    name: "Добавить сценарий",
    url: '/scenarios/create',
  },
  {
    name: "Добавить гостя",
    isEdit: true,
  },
]
const pendingMenuItems = computed(() => {
  const items = []
  if (groupsStore.getShowRoom) {
    items.push({
      name: "Редактировать комнату",
      url: `/user/group/edit/room/${groupsStore.getShowRoom}`,
    })
  }
  if (groupsStore.getShowFloor) {
    items.push({
      name: "Редактировать этаж",
      url: `/user/group/edit/floor/${groupsStore.getShowFloor}`,
    })
  }

  return items
})
const menuItems = computed(() => {
  if (route.fullPath === '/' || route.fullPath.startsWith('/user/group')) {
    return [...houses.value.filter(el => !el?.isPending), ...pendingMenuItems.value]
  }
  return houses.value.filter(el => !el?.isPending)
})
const ownerAddMenuItems = [
  {
    name: "Добавить комнату",
    url: '/user/group/add/room',
  },
  {
    name: "Добавить этаж",
    url: '/user/group/add/floor',
  },
  {
    name: "Добавить дом",
    url: '/user/group/add/house',
  },
]

const isAddMenuShow = ref(false)
const isSettingsMenuShow = ref(false)
const addMenu = ref(null)
const settingsMenu = ref(null)
const settingsMenuTrigger = ref(null)
const addMenuTrigger = ref(null)

onClickOutside(addMenu, () => {
  if (isAddMenuShow.value) {
    isAddMenuShow.value = false
  }
}, { ignore: [addMenuTrigger] })
onClickOutside(settingsMenu, () => {
  if (isSettingsMenuShow.value) {
    isSettingsMenuShow.value = false
  }
}, { ignore: [settingsMenuTrigger] })

watch(() => route.fullPath, () => {
  isSettingsMenuShow.value = false
  isAddMenuShow.value = false
})
</script>

<style lang="scss">
@import "assets/styles/layouts/_header";
</style>
