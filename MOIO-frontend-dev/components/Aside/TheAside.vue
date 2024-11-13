<template>
  <div class="aside">
    <!-- <div ref="trigger" :class="`aside-trigger ${isAsideCollapsed? '--collapsed':' '}`">
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
    </div> -->
    <div ref="aside" :class="`aside-collapse ${isAsideCollapsed&& '--collapsed'}`">
      <div class="scrollable-content">

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
      <div class="aside-border">
        <div class="aside-footer">
          <setting-group />
        </div>
      </div>
    </div>
  </div>
  <div class="tollbar__container">
    <div class="toolbar">
      <div class="toolbar__flex">
        <template v-if="groupsStore.canAutomate">
          <nuxt-link :class="`toolbar__flex-item ${currentRoute.path.includes('/automation',0) ? '--active':''}`" to="/automation">
            <ui-icon name="aside/automation" />
            <span style="white-space: nowrap;">Автом-ии</span>
          </nuxt-link>
          <nuxt-link :class="`toolbar__flex-item ${currentRoute.path.includes('/scenarios',0) ?'--active':''}`" to="/scenarios">
            <ui-icon name="aside/scenarios" />
            <span style="white-space: nowrap;">Сценарии</span>
          </nuxt-link>
        </template>
        <nuxt-link :class="`toolbar__flex-item ${currentRoute.path == '/'?'--active':''}`" to="/">
          <ui-icon name="aside/home" />
          <span style="white-space: nowrap;">Дом</span>
        </nuxt-link>
        <nuxt-link :class="`toolbar__flex-item ${currentRoute.path.includes('/category', 1) ? '--active':''}`" :to="categories?.at(0)?.url ?? '/user/category/1'">
          <ui-icon name="category" />
          <span style="white-space: nowrap;">Категории</span>
        </nuxt-link>
        <nuxt-link :class="`toolbar__flex-item ${currentRoute.path == '/user'?'--active':''}`" to="/user">
          <ui-icon name="aside/profile" />
          <span style="white-space: nowrap;">Профиль</span>
        </nuxt-link>
      </div>
    </div>        
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useCategoriesStore } from "~/store/categories"
import { useGroupsStore } from "~/store/groups"
import AsideCategory from '~/components/Aside/AsideCategory.vue'
import SettingGroup from "~/components/SettingGroup/SettingGroup.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { TUiIconNames } from "#build/types/ui-icon"

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

async function getGroupTypes () {
  await groupsStore.getGroupTypes()
}
getGroupTypes()

watch(currentRoute, () => {
  if (isAsideCollapsed.value) {
    isAsideCollapsed.value = false
    trigger.value.style.top = '-54px'
  }
}, { immediate: true })
</script>

<style lang="scss">
</style>
