<template>
  <div
    v-if="title?.length && url?.length"
    :class="`aside-item ${router.currentRoute.value.path === props.url?'--active':''}`"
  >
    <nuxt-link class="aside-item__link" :to="url">
      <ui-icon :name="icon" size="28" />
      <h2 class="aside-item__title">
        {{ title }}
      </h2>
    </nuxt-link>
    <nuxt-link v-if="isEditable" :to="`/user/group/edit/${editPostfix+id}`" class="aside-item__edit-btn">
      <ui-icon name="pencil" color="inherit" />
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon.vue"
import type { TUiIconNames } from "#build/types/ui-icon"

export interface AsideItem {
  icon:TUiIconNames,
  url:string,
  title:string
  isEditable?:boolean
  id?:number|string
  typeId?:number
}

const props = defineProps<AsideItem>()
const router = useRouter()

let editPostfix = 'room/'
if (props?.typeId === 2) {
  editPostfix = 'floor/'
}
if (props?.typeId === 1) {
  editPostfix = 'house/'
}
</script>

<style lang="scss">

</style>
