<template>
  <div class="header-content">
    <div class="header-content__menu-container">
      <ui-button
        v-if="groupsStore.canAutomate"
        ref="addMenuTrigger"
        class-name="blank"
        padding="0"
        @click="isAddMenuShow = !isAddMenuShow"
      >
        <ui-icon name="header/plus-circle-outline" size="40" />
      </ui-button>
      <transition name="fade">
        <header-menu
          v-show="isAddMenuShow"
          ref="addMenu"
          :items="isHouseEditable ? [...addMenuItems, ...ownerAddMenuItems] : [...addMenuItems]"
          @click="isAddMenuShow=false"
        />
      </transition>
    </div>
    <div class="header-content__menu-container">
      <ui-button
        ref="settingsMenuTrigger"
        class-name="blank"
        padding="0"
        @click="isSettingsMenuShow = !isSettingsMenuShow"
      >
        <ui-icon name="header/dots-horizontal" size="40" />
      </ui-button>
      <transition name="fade">
        <header-menu
          v-show="isSettingsMenuShow"
          ref="settingsMenu"
          :items="houses.filter(el=>!el?.isPending)"
          @click="isSettingsMenuShow=false"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import UiIcon from "~/components/ui/UiIcon.vue"
import { useUserStore } from "~/store/user"

const groupsStore = useGroupsStore()
const { id } = useUserStore()
const { houses, currentGroup } = storeToRefs(groupsStore)
const route = useRoute()
const isHouseEditable = ref(groupsStore.upGroups.find(el => el.id === groupsStore.currentHome)?.groupCreatorId === id)
const addMenuItems = [
  {
    icon: "aside/automation",
    name: "Добавить автоматизацию",
    url: '/automation/create',
  },
  {
    icon: "header/scenario",
    name: "Добавить сценарий",
    url: '/scenarios/create',
  },
]
const ownerAddMenuItems = [
  {
    icon: "aside/room",
    name: "Добавить комнату",
    url: '/user/group/add/room',
  },
  {
    icon: "aside/floor",
    name: "Добавить этаж",
    url: '/user/group/add/floor',
  },
  {
    icon: "header/home",
    name: "Добавить дом",
    url: '/user/group/add/house',
  }]
const isAddMenuShow = ref(false)
const isSettingsMenuShow = ref(false)
const addMenu = ref(null)
const settingsMenu = ref(null)
const settingsMenuTrigger = ref(null)
const addMenuTrigger = ref(null)

onClickOutside(addMenu, (e) => {
  if (isAddMenuShow.value) {
    isAddMenuShow.value = false
  }
}, { ignore: [addMenuTrigger] })
onClickOutside(settingsMenu, (e) => {
  if (isSettingsMenuShow.value) {
    isSettingsMenuShow.value = false
  }
}, { ignore: [settingsMenuTrigger] })

watch(() => route.fullPath, () => {
  isSettingsMenuShow.value = false
  isAddMenuShow.value = false
})
watch(() => groupsStore.currentHome, () => {
  isHouseEditable.value = groupsStore.upGroups.find(el => el.id === groupsStore.currentHome)?.groupCreatorId === id
})

</script>

<style lang="scss">
@import "assets/styles/layouts/_header";
</style>
