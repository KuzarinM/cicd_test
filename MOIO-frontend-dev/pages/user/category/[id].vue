<template>
  <div class="category">
    <loader-screen :is-loading="isLoading" />
    <div class="category-flex">
      <h1 class="category__header">
        {{ currentCategory?.name }}
      </h1>
      <ui-button
        ref="addMenuTrigger"
        class="category__button-expand"
        @click="isCategoryMenuShow = !isCategoryMenuShow"
      >
        <ui-icon name="arrow-down" size="20" :filled="true" />
      </ui-button>
      <div class="category-container">
        <transition name="fade">
          <header-menu
            v-show="isCategoryMenuShow"
            ref="addMenu"
            :items="categories"
            @click="isCategoryMenuShow=false"
          />
        </transition>
      </div>
    </div>

    <div class="category__group-list">
      <div v-for="(devices, group) in devicesInCategory" :key="group" class="category__group">
        <h2 class="category__group-header">
          {{ group }}
        </h2>
        <div class="category__group-service-list">
          <the-service
            v-for="service in devices"
            :id="service.id"
            :key="service.id"
            :group-id="categoryId"
            :name="service.name"
            :type="service.type"
            :device-custom-type="service.deviceCustomType"
            :capabilities="service?.capabilities"
            :device-icon="service.deviceIcon"
            :can-edit="groupStore.canEdit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import TheService from '~/components/Service/TheService.vue'
import { useCategoriesStore } from "~/store/categories"
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import type { TUiIconNames } from "#build/types/ui-icon"

const isCategoryMenuShow = ref(false)
const categoryStore = useCategoriesStore()
const groupStore = useGroupsStore()
const { devicesInCategory, currentCategory } = storeToRefs(categoryStore)
const route = useRoute()
const categoryId = Number(route.params.id)
const categories = ref<{
  icon: TUiIconNames,
  name:string,
  url: string,
  editable?:boolean
  id?:number|string
}[]>()

const home = groupStore.currentHome
const fetchCategories = useLazyAsyncData(
  `categoryById-${categoryId}`,
  () => categoryStore.getDevicesByCategoryId(categoryId, home),
)
const isLoading = computed(() => fetchCategories.pending.value)
const addMenu = ref(null)
const addMenuTrigger = ref(null)

onClickOutside(addMenu, (e) => {
  if (isCategoryMenuShow.value) {
    isCategoryMenuShow.value = false
  }
}, { ignore: [addMenuTrigger] })

async function getCategories () {
  await categoryStore.getAll()
  categories.value = categoryStore.allCategories()
}
getCategories()

onBeforeRouteLeave(async (to, from, next) => {
  await categoryStore.leaveCategory()
  next()
})
</script>

<style lang="scss">
@import "assets/styles/page/user-category";
</style>
