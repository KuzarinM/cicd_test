<template>
  <div class="header-menu">
    <nuxt-link v-for="item in items" :key="item.icon+item.name+item.id" :to="item?.url||'/'">
      <div :class="`header-menu__item ${item?.isActive?'--active':''}`">
        <ui-icon :name="item.icon" size="28" />
        <span class="header-menu__item-title">{{ item.name }}</span>
        <nuxt-link v-if="item.isEditable" :to="`/user/group/edit/house/${item.id}`" class="header-menu__item-edit">
          <ui-icon name="pencil" :size="28" />
        </nuxt-link>
      </div>
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import type { TUiIconNames } from "#build/types/ui-icon"
import UiIcon from "~/components/ui/UiIcon.vue"

export interface HeaderMenuProps {
  items:{
    id:string
    icon:TUiIconNames,
    name:string,
    url?:string
    isActive?:boolean
    isEditable?:boolean
  }[]
}

const props = defineProps<HeaderMenuProps>()
</script>

<style lang="scss">
.header-menu__item-edit{
  display: block;
  margin-inline-start: auto;

}
</style>

