<template>
  <div class="header-menu">
    <div class="scrollable-content scrollable-content--with-padding">
      <div class="header-menu__item-list">
        <template
          v-for="item in items"
          :key="item.id"
        >
          <div
            v-if="(item.isEdit && router.currentRoute.value.fullPath === '/' || router.currentRoute.value.fullPath.startsWith('/user/group/')) || item.url"
          >
            <button v-if="item.isEdit" class="header-menu__item-btn" @click="groupStore.isAddRoommates = true">
              {{ item.name }}
            </button>
            <nuxt-link v-if="item.url" :to="item?.url || '/'">
              <div :class="`header-menu__item ${item?.isActive ? '--active' : ''}`">
                <ui-icon :name="item.icon" class="header-menu__item-icon" />
                <span class="header-menu__item-title">{{ item.name }}</span>
                <nuxt-link
                  v-if="item.isEditable" :to="`/user/group/edit/house/${item.id}`"
                  class="header-menu__item-edit"
                >
                  <ui-icon name="pencil" :size="24" />
                </nuxt-link>
              </div>
            </nuxt-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TUiIconNames } from "#build/types/ui-icon"
import UiIcon from "~/components/ui/UiIcon.vue"
import { useGroupsStore } from "~/store/groups"

export interface HeaderMenuProps {
  items: {
    isEdit?: boolean
    id: string
    icon?: TUiIconNames,
    name: string,
    url?: string
    isActive?: boolean
    isEditable?: boolean
  }[]
}

const groupStore = useGroupsStore()
const props = defineProps<HeaderMenuProps>()
const router = useRouter()
</script>

<style lang="scss">
.header-menu__item-edit {
  display: block;
}
</style>
