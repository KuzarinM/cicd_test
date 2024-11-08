<template>
  <div class="category">
    <loader-screen :is-loading="isLoading" />
    <h1 class="category__header">
      {{ groupData?.name }}
    </h1>
    <div v-if="groupData?.groups" class="category__group-list">
      <div v-for="group in Object.keys(groupData.groups)" :key="group" class="category__group">
        <h2 v-if="groupData.groups[group]?.length" class="category__group-header">
          {{ group }}
        </h2>
        <div v-if="groupData.groups[group]?.length" class="category__group-service-list">
          <the-service
            v-for="service in groupData.groups[group]"
            :id="service.id"
            :key="service.id"
            :group-id="categoryId"
            :name="service.name"
            :type="service.type"
            :capabilities="service?.capabilities"
            :device-icon="service.deviceIcon"
            :can-edit="canEdit"
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
import { type IDevicesInCategory } from "~/api/category/getDevicesByCategoryId"

const categoryStore = useCategoriesStore()
const groupStore = useGroupsStore()
const { devicesInCategory } = storeToRefs(categoryStore)
const route = useRoute()
const categoryId = Number(route.params.id) as number
const groupData = ref<{name:string, groups:IDevicesInCategory}>({ name: '', groups: {} })
const canEdit = ref(groupStore.canEdit)
const home = groupStore.currentHome
const fetchCategories = useLazyAsyncData(
  `categoryById-${categoryId}`,
  () => categoryStore.getDevicesByCategoryId(categoryId, home),
)
const isLoading = computed(() => fetchCategories.pending.value)
groupData.value.name = categoryStore.categoryById(categoryId)?.name ?? ""

watch(devicesInCategory, (newVal, oldValue) => {
  groupData.value.name = categoryStore.categoryById(categoryId)?.name ?? ""
  if (Object.keys(newVal)) {
    groupData.value.groups = newVal
    return
  }
  groupData.value.groups = {}
}, { deep: true, immediate: true })
</script>

<style lang="scss">
@import "assets/styles/page/user-category";

</style>
