<template>
  <div class="aside">
    <div ref="trigger" :class="`aside-trigger ${isAsideCollapsed? '--collapsed':' '}`">
      <ui-button
        class-name="blank"
        margin-inline="0"
        padding="0"
      >
        <ui-icon
          :name="isAsideCollapsed? 'close':'aside/menu'"
          size="40"
          @click="isAsideCollapsed=!isAsideCollapsed"
        />
      </ui-button>
    </div>
    <div ref="aside" :class="`aside-collapse ${isAsideCollapsed&& '--collapsed'}`">
      <div class="aside-main">
        <aside-category
          category-header="Основное"
          :category-items="groupsStore.canAutomate ?
            [...asideContent.categoryContent,...automateLinks]
            : asideContent.categoryContent"
        />
        <aside-category
          v-if="typeof categories !== 'undefined'"
          category-header="Категории"
          :category-items="categories"
        />
        <aside-category
          v-if="typeof rooms !== 'undefined' && rooms?.length"
          category-header="Комнаты"
          :category-items="rooms"
        />
        <aside-category
          v-if="typeof floors !== 'undefined' && floors?.length"
          category-header="Этажи"
          :category-items="floors"
        />
      </div>
      <div class="aside-footer">
        <button class="aside-footer__item" @click="colorMode.toggle()">
          <ui-icon name="aside/theme" size="28" />{{ colorMode?.name.value.includes('dark') ?"Светлая тема":"Темная тема" }}
        </button>
        <button class="aside-footer__item" @click="logout()">
          <ui-icon name="aside/logout" size="26" />
          Выйти
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AsideCategory from '~/components/Aside/AsideCategory.vue'
import { useUserStore } from "~/store/user"
import { useCategoriesStore } from "~/store/categories"
import { useGroupsStore } from "~/store/groups"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { TUiIconNames } from "#build/types/ui-icon"
import useColorTheme from "~/composables/useColorTheme"

export interface IAsideContent {
  categoryTitle:string
  categoryContent:{
    icon:TUiIconNames
    name:string,
    url:string
  }[]
}
const groupsStore = useGroupsStore()
const categoriesStore = useCategoriesStore()
const colorMode = useColorTheme()
const { currentRoute } = useRouter()
const { rooms, floors } = storeToRefs(groupsStore)
const isAsideCollapsed = ref(false)
const categories = ref<{
  icon: TUiIconNames,
  name:string,
  url: string,
  editable?:boolean
  id?:number|string
}[]>()
const asideContent:IAsideContent =
  {
    categoryTitle: 'Основное',
    categoryContent: [
      {
        icon: 'aside/home',
        name: 'дом',
        url: '/',
      },
      {
        icon: 'aside/profile',
        name: 'профиль',
        url: '/user',
      },
    ],
  }
const automateLinks:IAsideContent["categoryContent"] = [
  {
    icon: 'aside/automation',
    name: 'автоматизации',
    url: '/automation',
  },
  {
    icon: 'aside/scenarios',
    name: 'сценарии',
    url: '/scenarios',
  }]
const aside = ref()
const trigger = ref()
useTransformOnScroll(aside, [trigger], '-54px', '-124px', 'top')

async function getCategories () {
  await categoriesStore.getAll()
  categories.value = categoriesStore.allCategories()
  await groupsStore.getAll()
}
getCategories()

function logout () {
  const userStore = useUserStore()
  userStore.logout()
}
watch(currentRoute, () => {
  if (isAsideCollapsed.value) {
    isAsideCollapsed.value = false
    trigger.value.style.top = '-54px'
  }
}, { immediate: true })
</script>

<style lang="scss">
</style>
